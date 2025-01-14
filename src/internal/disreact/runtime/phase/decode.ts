import {TxFlag} from '#pure/dfx';
import {E} from '#pure/effect';
import {Err, Failure, Ix, Route, VDocument, VEvent} from '#src/internal/disreact/entity/index.ts';
import {annotatePhase} from '#src/internal/disreact/runtime/helpers.ts';
import {MemoryStore} from '#src/internal/disreact/runtime/layers/memory-store.ts';
import {RouteManager} from '#src/internal/disreact/runtime/layers/route-manager.ts';
import {pipelines} from '#src/internal/disreact/runtime/pipelines/pipelines.ts';


const annotations = annotatePhase('decode');


export const decode = E.fn(':decode')(
  function * () {
    yield * E.logTrace(`[decode]`);

    const rest   = yield * RouteManager.rest();
    const router = yield * RouteManager.getRouter();

    const route_data = router.parseId(rest);
    const route_url  = router.parseUrl(rest);


    if (!route_data || !route_url) return yield * new Failure.Critical({why: 'Routing Failed'});

    yield * E.logTrace(`ephemeral: ${rest.message?.flags === TxFlag.EPHEMERAL}`);
    yield * E.logTrace(route_data.original);
    yield * E.logTrace(route_url.original);


    yield * RouteManager.setParams(route_url.params);
    yield * RouteManager.setSearch(route_url.query);

    const rdocument = yield * VDocument.makeFromRest;
    yield * MemoryStore.setRest(rdocument);

    const params = yield * RouteManager.getParams();

    if (Ix.isRestSubmit(rest, rest.data)) {
      yield * MemoryStore.pushEvent(VEvent.Submitted());
    }
    else {
      yield * MemoryStore.pushEvent(VEvent.Clicked({
        row: Route.getRow(route_data),
        col: Route.getCol(route_data),
      }));
    }


    if (!(params.pipe_id in pipelines)) return yield * new Err.PipelineNotFound();

    const simulation = pipelines[params.pipe_id as keyof typeof pipelines];
    yield * simulation();
  },
);
