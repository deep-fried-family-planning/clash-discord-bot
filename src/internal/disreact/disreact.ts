import {E, flow, g, L, pipe} from '#pure/effect';
import {DFFP_URL} from '#src/constants/dffp-alias.ts';
import {DiscordLayerLive} from '#src/discord/layer/discord-api.ts';
import {Failure, type Ix} from '#src/internal/disreact/entity/index.ts';
import type {KeyNamedRoots} from '#src/internal/disreact/entity/root.ts';
import {DiscordBroker} from '#src/internal/disreact/main/layers/discord-broker.ts';
import {MemoryStore} from '#src/internal/disreact/main/layers/memory-store.ts';
import {MutexBroker} from '#src/internal/disreact/main/layers/mutex-broker.ts';
import {NodeManager} from '#src/internal/disreact/main/layers/node-manager.ts';
import {PipelineManager} from '#src/internal/disreact/main/layers/pipeline-manager.ts';
import {RouteManager} from '#src/internal/disreact/main/layers/route-manager.ts';
import {DirectSimulation} from '#src/internal/disreact/main/pipelines/direct-simulation.ts';
import {ClickSimulation} from '#src/internal/disreact/main/pipelines/simulate-click.ts';
import {SubmitSimulation} from '#src/internal/disreact/main/pipelines/simulate-submit.ts';


const runner = (rest: Ix.Rest) => g(function * () {
  yield * MemoryStore.allocate(rest);
  yield * RouteManager.allocate(rest);
  yield * DiscordBroker.allocate(rest);

  const router     = yield * RouteManager.getRouter();
  const route_data = router.parseId(rest);
  const route_url  = router.parseUrl(rest);

  if (!route_data || !route_url) {
    return yield * new Failure.Critical({why: 'Routing Failed'});
  }

  yield * RouteManager.setParams(route_url.params);
  yield * RouteManager.setSearch(route_url.query);
});


export const createEffectfulDisReact = (
  roots: KeyNamedRoots,
) => {
  const requirements = pipe(
    L.empty,
    L.provideMerge(PipelineManager.makeLayer([
      ClickSimulation,
      SubmitSimulation,
      DirectSimulation,
    ])),
    L.provideMerge(NodeManager.makeLayer(roots)),
    L.provideMerge(RouteManager.makeLayer(DFFP_URL)),
    L.provideMerge(MemoryStore.makeLayer()),
    L.provideMerge(DiscordBroker.makeLayer()),
    L.provideMerge(MutexBroker.singletonLayer),
    L.provideMerge(DiscordLayerLive),
  );

  return {
    respond: flow(
      runner,
      E.flatMap(() => g(function * () {
        const params   = yield * RouteManager.getParams();
        const pipeline = yield * PipelineManager.getPipeline(params.pipe_id);

        yield * MutexBroker.acquire();
        yield * pipeline.run();
        yield * MutexBroker.release();
      })),
      E.provide(requirements),
    ),
  };
};
