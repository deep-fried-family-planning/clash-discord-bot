import {E, pipe} from '#src/disreact/codec/re-exports.ts'
import type {Fibril} from '#src/disreact/model/comp/fibril.ts'
import {Relay} from '#src/disreact/model/Relay.ts'
import {SourceRegistry} from '#src/disreact/model/SourceRegistry.ts'
import {Lifecycles} from './lifecycles'

export * as Model from './model.ts'
export type Model = never

export const initEntrypoint = () => {}

export const hydrateInvoke = (hydrant: Fibril.Hydrant, event: any) =>
  pipe(
    E.andThen(SourceRegistry, (registry) => registry.fromHydrant(hydrant)),
    E.tap((original) =>
      pipe(
        Lifecycles.hydrate(original),
        E.andThen(() => Lifecycles.handleEvent(original, event)),
        E.andThen(() => Lifecycles.rerender(original)),
        E.andThen(() => E.andThen(Relay, (relay) => relay.setOutput(original))),
        E.fork,
      ),
    ),
    E.andThen((original) =>
      E.andThen(Relay, (relay) =>
        pipe(
          relay.awaitOutput(),
          E.andThen((output) => {
            if (output === null || output.id === original.id) {
              return E.succeed(output)
            }
            return Lifecycles.initialize(output)
          }),
          E.tap(() => relay.setComplete()),
        ),
      ),
    ),
  )

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
