import {E, flow, L, pipe} from '#pure/effect';
import {DFFP_URL} from '#src/constants/dffp-alias.ts';
import {DiscordLayerLive} from '#src/discord/layer/discord-api.ts';
import type {KeyNamedRoots} from '#src/internal/disreact/entity/root.ts';
import {interact} from '#src/internal/disreact/lifecycle/interact.ts';
import {DiscordBroker} from '#src/internal/disreact/lifecycle/layers/discord-broker.ts';
import {MemoryStore} from '#src/internal/disreact/lifecycle/layers/memory-store.ts';
import {MutexBroker} from '#src/internal/disreact/lifecycle/layers/mutex-broker.ts';
import {NodeManager} from '#src/internal/disreact/lifecycle/layers/node-manager.ts';
import {RouteManager} from '#src/internal/disreact/lifecycle/layers/route-manager.ts';
import {synthesize} from '#src/internal/disreact/lifecycle/synthesize.ts';


export const createEffect = (
  roots: KeyNamedRoots,
) => {
  const requirements = pipe(
    L.empty,
    L.provideMerge(NodeManager.makeLayer(roots)),
    L.provideMerge(RouteManager.makeLayer(DFFP_URL)),
    L.provideMerge(MemoryStore.makeLayer()),
    L.provideMerge(DiscordBroker.makeLayer()),
    L.provideMerge(MutexBroker.singletonLayer),
    L.provideMerge(DiscordLayerLive),
  );

  return {
    interact  : flow(interact, E.provide(requirements)),
    synthesize: flow(synthesize, E.provide(requirements)),
  };
};
