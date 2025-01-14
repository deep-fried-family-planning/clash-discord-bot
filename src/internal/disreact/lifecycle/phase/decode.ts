import {g} from '#pure/effect';
import {Err, Failure, VDocument} from '#src/internal/disreact/entity/index.ts';
import {MemoryStore} from '#src/internal/disreact/lifecycle/layers/memory-store.ts';
import {RouteManager} from '#src/internal/disreact/lifecycle/layers/route-manager.ts';
import {pipelines} from '#src/internal/disreact/lifecycle/simulation/pipelines.ts';


export const decode = g(function * () {
  const rest   = yield * RouteManager.rest();
  const router = yield * RouteManager.getRouter();

  // todo application commands
  if (rest.data) {

  }

  const route_data = router.parseId(rest);
  const route_url  = router.parseUrl(rest);

  if (!route_data || !route_url) {
    return yield * new Failure.Critical({why: 'Routing Failed'});
  }

  yield * RouteManager.setParams(route_url.params);
  yield * RouteManager.setSearch(route_url.query);

  const rdocument = yield * VDocument.makeFromRest;
  yield * MemoryStore.setRest(rdocument);

  const params = yield * RouteManager.getParams();

  if (!(params.pipe_id in pipelines)) return yield * new Err.PipelineNotFound();

  const simulation = pipelines[params.pipe_id as keyof typeof pipelines];
  yield * simulation;
});
