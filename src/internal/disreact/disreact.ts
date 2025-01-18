import {E, flow, L, pipe} from '#pure/effect';
import {DFFP_URL} from '#src/constants/dffp-alias.ts';
import type {KeyNamedRoots} from '#src/internal/disreact/entity/root.ts';
import {interact} from '#src/internal/disreact/runtime-old/interact.ts';
import {DiscordBroker} from '#src/internal/disreact/runtime-old/layers/discord-broker.ts';
import {MemoryStore} from '#src/internal/disreact/runtime-old/layers/memory-store.ts';
import {MutexBroker} from '#src/internal/disreact/runtime-old/layers/mutex-broker.ts';
import {NodeManager} from '#src/internal/disreact/runtime-old/layers/node-manager.ts';
import {RouteManager} from '#src/internal/disreact/runtime-old/layers/route-manager.ts';
import {synthesize} from '#src/internal/disreact/runtime-old/synthesize.ts';


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
  );

  return {
    interact: flow(
      interact,
      E.awaitAllChildren,
      E.tap(E.logTrace('interact complete')),
      E.withLogSpan('exec_ms'),
      E.provide(requirements),
    ),
    synthesize: flow(synthesize, E.provide(requirements), E.awaitAllChildren),
  };
};

// E.annotateLogs('export', 'interact'), E.tap(E.annotateCurrentSpan('export', 'interact'))
// E.annotateLogs('export', 'synthesize'), E.tap(E.annotateCurrentSpan('export', 'synthesize'))
