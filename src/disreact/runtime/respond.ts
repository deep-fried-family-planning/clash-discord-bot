import {Codec} from '#src/disreact/codec/codec.ts'
import {Doken} from '#src/disreact/codec/doken.ts'
import {Fibril} from '#src/disreact/model/fibril/fibril.ts'
import {Relay, Status} from '#src/disreact/model/Relay.ts'
import {DF, DT, E, F, O, pipe, RDT} from '#src/disreact/re-exports.ts'
import {DokenMemory} from '#src/disreact/runtime/DokenMemory.ts'
import {IxDOM} from '#src/disreact/runtime/IxDOM.ts'
import {Model} from '../model/model'

interface Respond {
  fresh  : Doken.Fresh
  message: any
  event  : any
}

const resolveParamDoken = (doken?: Doken) => !doken || doken._tag === 'Spent'
  ? E.succeed(undefined)
  : pipe(
    DT.isPast(doken.ttl),
    E.if({
      onTrue : () => E.succeed(undefined),
      onFalse: () => doken._tag === 'Defer'
        ? E.succeed(undefined)
        : DokenMemory.load(doken.id),
    }),
  )

const resolveRelayStatus = () => Relay.take().pipe(E.catchTag('NoSuchElementException', () => E.succeed(Status.Complete())))

export const respond = (body: Respond) => E.gen(function* () {
  const params = yield* Codec.decodeRoute(body.message)
  const deferDoken = yield* DF.make<Doken.Defer>()
  const model = yield* E.fork(Model.invokeRoot(params.hydrant, body.event))

  let status: Status | null = yield* resolveRelayStatus()

  while (status?._tag !== 'Complete') {
    if (status._tag === 'Close') {
      const param = yield* resolveParamDoken(params.doken)
      const fresh = body.fresh

      if (!param) {
        yield* IxDOM.defer(fresh.id, RDT.value(fresh.val), {type: 6})
        yield*IxDOM.dismount(fresh.app, RDT.value(fresh.val))
      }
      else {
        yield* E.fork(
          IxDOM.discard(fresh.id, RDT.value(fresh.val), {type: 7}),
        )
        yield* E.fork(
          IxDOM.dismount(fresh.app, RDT.value(param.val)),
        )
      }
      return
    }

    if (status._tag === 'Next') {
      const param = yield* resolveParamDoken(params.doken)

      if (status.id === params.hydrant.id) {
        const fresh = body.fresh

        if (!param) {
          const defer = yield* Doken.makeOptimizedDeferFromFresh(body, fresh)
          yield* E.fork(
            IxDOM.defer(defer.id, RDT.value(defer.val), {type: defer.type}),
          )
          yield* DF.succeed(deferDoken, defer)
        }
        else {
          yield* E.fork(
            IxDOM.discard(fresh.id, RDT.value(fresh.val), {type: 7}),
          )
          yield* DF.succeed(deferDoken, param)
        }
      }
    }

    if (status._tag === 'Partial') {
      const maybe = yield* DF.poll(deferDoken)
      const doken = O.isSome(maybe)
        ? yield* maybe.value
        : undefined

      if (!doken || doken.flag !== status.flags) {
        const defer = yield* Doken.makeDeferFromFresh(body, body.fresh, status.flags)
        yield* E.fork(
          IxDOM.defer(defer.id, RDT.value(defer.val), defer.flag === 2
            ? {type: defer.type, data: {flags: 64}}
            : {type: defer.type}),
        )
        yield* DF.succeed(deferDoken, defer)
      }

      break
    }

    status = yield* resolveRelayStatus()
  }

  const output = yield* F.join(model)
  const encoded = yield* Codec.encodeRoot(output)
  const doken = yield* DF.await(deferDoken)
  const final = yield* Codec.encodeRoute([
    {
      doken  : doken,
      hydrant: Fibril.encodeNexus(output!.nexus),
    },
    encoded.message[0],
  ])

  yield* IxDOM.reply(body.fresh.app, RDT.value(doken.val), final)
}).pipe(
  E.provide([Relay.Fresh]),
)


// export const respondPiped = (body: any) =>
//   pipe(
//     E.all({
//       params    : Codec.decodeRoute(body.message),
//       freshDoken: Doken.makeFreshFromRequest(body),
//     }),
//     E.tap((initial) => E.forkAll([
//       IxManager.setParamDoken(initial.params.doken),
//       pipe(
//         Model.invokeRoot(initial.params.hydrant, body.event),
//         E.tap((root) => IxManager.setNextRoot(root)),
//         E.tap((root) =>
//           pipe(
//             Codec.encodeRoot(root),
//             E.andThen((encoding) => IxManager.setOutput(encoding)),
//           ),
//         ),
//       ),
//     ])),
//     E.andThen((setup) => E.iterate(Relay.None(), {
//       while: (status) =>
//         !Relay.isComplete(status),
//
//       body: () => pipe(
//         Relay.take(),
//         E.catchTag('NoSuchElementException', () => E.succeed(Relay.Complete())),
//         E.andThen((current) => Relay.match(current, {
//           None    : (status) => E.succeed(status),
//           Handled : (status) => E.succeed(status),
//           Complete: (status) => E.succeed(status),
//
//           Close: () =>
//             pipe(
//               IxManager.awaitParamDoken(),
//               E.andThen((param) => {
//                 const fresh = setup.freshDoken
//
//                 if (!param) {
//                   return pipe(
//                     IxDOM.defer(fresh.id, RDT.value(fresh.val), {type: 6}),
//                     E.andThen(() => IxDOM.dismount(fresh.app, RDT.value(fresh.val))),
//                   )
//                 }
//
//                 return E.all([
//                   IxDOM.discard(fresh.id, RDT.value(fresh.val), {type: 7}),
//                   IxDOM.dismount(fresh.app, RDT.value(param.val)),
//                 ])
//               }),
//               E.fork,
//               E.as(Relay.Complete()),
//             ),
//
//           Next: (status) =>
//             pipe(
//               IxManager.awaitParamDoken(),
//               E.andThen((param) => {
//                 if (status.id !== setup.params.hydrant.id) {
//                   return E.succeed(status)
//                 }
//
//                 const fresh = setup.freshDoken
//
//                 if (!param) {
//                   return pipe(
//                     Doken.makeOptimizedDeferFromFresh(body, fresh),
//                     E.tap((defer) => IxDOM.defer(defer.id, RDT.value(defer.val), {type: defer.type})),
//                     E.tap((defer) => IxManager.setCurrentDoken(defer)),
//                     E.fork,
//                     E.as(status),
//                   )
//                 }
//
//                 return pipe(
//                   E.all([
//                     IxDOM.discard(fresh.id, RDT.value(fresh.val), {type: 7}),
//                     IxManager.setCurrentDoken(param),
//                   ]),
//                   E.fork,
//                   E.as(status),
//                 )
//               }),
//             ),
//
//           Partial: (status) =>
//             pipe(
//               IxManager.pollDefer(),
//               E.andThen((doken) => O.isSome(doken) ? doken.value : E.succeed(undefined)),
//               E.andThen((doken) => {
//                 if (doken?._tag === 'Defer' && doken.flag === status.flags) {
//                   return E.succeed(Relay.Complete())
//                 }
//
//                 const fresh = setup.freshDoken
//
//                 return pipe(
//                   Doken.makeDeferFromFresh(body, fresh, status.flags),
//                   E.tap((defer) =>
//                     IxDOM.defer(defer.id, RDT.value(defer.val), defer.flag === 2
//                       ? {type: defer.type, data: {flags: 64}}
//                       : {type: defer.type}),
//                   ),
//                   E.tap((defer) => IxManager.setCurrentDoken(defer)),
//                   E.fork,
//                   E.as(Relay.Complete()),
//                 )
//               }),
//             ),
//         })),
//       ),
//     })),
//     E.andThen(() => E.all({
//       root  : IxManager.awaitNextRoot(),
//       output: IxManager.awaitOutput(),
//       doken : IxManager.awaitCurrentDoken(),
//     })),
//     E.andThen((final) =>
//       pipe(
//         Codec.encodeRoute([
//           {
//             doken  : final.doken,
//             hydrant: Fibril.encodeNexus(final.root.nexus),
//           },
//           final.output.message[0],
//         ]),
//         E.tap((output: any) => IxDOM.reply(
//           body.application_id,
//           RDT.value(final.doken.val),
//           output,
//         )),
//       ),
//     ),
//     E.provide([
//       Relay.Fresh,
//       IxManager.Fresh,
//     ]),
//   )
