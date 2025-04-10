import {Dispatcher} from '#src/disreact/model/Dispatcher.ts';
import type {Tether, Hydrant} from '#src/disreact/model/entity/tether.ts';
import type {Rehydrant} from '#src/disreact/model/entity/rehydrant.ts';
import type {Trigger} from '#src/disreact/model/entity/trigger.ts';
import {Registry} from '#src/disreact/model/Registry.ts';
import {Relay} from '#src/disreact/model/Relay.ts';
import {E, pipe} from '#src/disreact/utils/re-exports.ts';
import {FiberMap} from 'effect';
import {Lifecycles} from './lifecycles';

export const makeEntrypoint = (key: Registry.Key, props?: any) =>
  pipe(
    E.flatMap(Registry, (registry) => registry.checkout(key, props)),
    E.flatMap((root) => Lifecycles.initialize(root)),
  );

export const hydrateInvoke = (dehydrated: Rehydrant.Dehydrated, event: Trigger) =>
  pipe(
    Registry.rehydrate(dehydrated),
    E.tap((original) =>
      pipe(
        Lifecycles.hydrate(original),
        E.tap(() => Lifecycles.handleEvent(original, event)),
        E.tap(() => Lifecycles.rerender(original)),
        E.tap(() => E.tap(Relay, (relay) => relay.setOutput(original))),
        E.fork,
      ),
    ),
    E.flatMap((original) =>
      E.flatMap(Relay, (relay) =>
        pipe(
          relay.awaitOutput(),
          E.flatMap((output) => {
            if (output === null || output.id === original.id) {
              return E.succeed(output);
            }
            return Lifecycles.initialize(output);
          }),
          E.tap(() => relay.setComplete()),
        ),
      ),
    ),
  );

export class Model extends E.Service<Model>()('disreact/Model', {
  effect: pipe(
    E.all({
      roots: FiberMap.make<Hydrant, Rehydrant>(),
    }),
    E.map(({}) => {
      return {

      };
    }),
  ),
  dependencies: [
    Dispatcher.Default,
    Registry.Default,
  ],
}) {
  static readonly makeEntrypoint = makeEntrypoint;
  static readonly hydrateInvoke = hydrateInvoke;
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
