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


// E.gen(function* () {
//     const original = yield* SourceRegistry.withHydrant(hydrant)
//
//     yield* pipe(
//       Lifecycles.hydrate(original),
//       E.andThen(() => Lifecycles.handleEvent(original, event)),
//       E.andThen(() => Lifecycles.rerender(original)),
//       E.andThen(() => Relay.setOutput(original)),
//       E.fork,
//     )
//
//     let output: O.Option<E.Effect<Root | null>>
//     do {
//       output = yield* Relay.pollOutput()
//
//       if (O.isSome(output)) {
//         const next = yield* output.value
//
//         if (next === null) {
//           yield* Relay.complete()
//           return null
//         }
//         else if (next.id !== original.id) {
//           return yield* pipe(
//             Lifecycles.initialize(next),
//             E.tap(() => Relay.complete()),
//           )
//         }
//         else {
//           yield* Relay.complete()
//           return next
//         }
//       }
//     }
//     while (O.isNone(output))
//   })
