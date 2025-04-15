import {HooksDispatcher} from '#src/disreact/model/HooksDispatcher.ts';
import type {Rehydrant} from '#src/disreact/model/entity/rehydrant.ts';
import type {Trigger} from '#src/disreact/model/entity/trigger.ts';
import {Registry} from '#src/disreact/model/Registry.ts';
import {Relay} from '#src/disreact/model/Relay.ts';
import {E, pipe} from '#src/disreact/utils/re-exports.ts';
import {runMain} from '@effect/platform-node/NodeRuntime';
import {Fiber, FiberMap} from 'effect';
import {Lifecycles} from './lifecycles';
import { Hooks } from './hooks';

export const makeEntrypoint = (key: Registry.Key, props?: any) =>
  pipe(
    Registry.checkout(key, props),
    E.tap((root) => Lifecycles.initialize(root)),
  );

export const hydrateInvoke = (dehydrated: Rehydrant.Decoded, event: Trigger) =>
  pipe(
    Registry.rehydrate(dehydrated),
    E.tap((original) =>
      pipe(
        Lifecycles.hydrate(original),
        E.tap(() => Lifecycles.handleEvent(original, event)),
        E.tap(() => Lifecycles.rerender(original)),
        E.flatMap(() =>
          Relay.use((relay) =>
            pipe(
              relay.setOutput(original),
            ),
          ),
        ),
        E.forkWithErrorHandler((e) => E.die(e as Error)),
      ),
    ),
    E.flatMap((original) =>
      Relay.use((relay) =>
        pipe(
          Relay.use((relay) => relay.awaitOutput()),
          E.tap((output) => {
            if (output === null || output.id === original.id) {
              return;
            }
            return Lifecycles.initialize(output);
          }),
          E.tap(() => Relay.use((relay) => relay.setComplete())),
        ),
      ),
    ),
  );

export class Model extends E.Service<Model>()('disreact/Model', {
  effect: pipe(
    E.all({
      roots: FiberMap.make<Rehydrant.Rehydrant, Rehydrant>(),
    }),
    E.map(() => {
      return {};
    }),
  ),
  dependencies: [
    HooksDispatcher.Default,
    Registry.Default,
  ],
}) {
  static readonly makeEntrypoint = makeEntrypoint;
  static readonly hydrateInvoke = hydrateInvoke;

  static readonly impl = {
    useState  : Hooks.$useState,
    useReducer: Hooks.$useReducer,
    useEffect : Hooks.$useEffect,
    usePage   : Hooks.$usePage,
    useIx     : Hooks.$useIx,
  };
}
