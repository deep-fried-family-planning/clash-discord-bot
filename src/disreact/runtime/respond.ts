import {Doken, type Defer} from '#src/disreact/codec/doken.ts'
import {DokenMemory} from '#src/disreact/codec/DokenMemory.ts'
import {ElemCodec} from '#src/disreact/codec/ElemCodec.ts'
import {RestCodec} from '#src/disreact/codec/RestCodec.ts'
import {RxTx} from '#src/disreact/codec/rxtx.ts'
import {Fibril} from '#src/disreact/model/comp/fibril.ts'
import type {RelayStatus} from '#src/disreact/model/Relay.ts'
import {Relay} from '#src/disreact/model/Relay.ts'
import {DisReactDOM} from '#src/disreact/runtime/DisReactDOM.ts'
import {DF, DT, E, F, pipe} from '#src/disreact/utils/re-exports.ts'
import {Model} from '../model/model'

export const respond = (body: any) => E.gen(function* () {
  const restCodec = yield* RestCodec
  const request = restCodec.decodeRequest(body)
  const model = yield* forkModelInvoke(request)
  const param = yield* forkResolveDoken(request.defer)
  const fresh = request.fresh
  const final = yield* DF.make<Doken.Defer | Doken.Spent>()

  let status: RelayStatus | undefined = undefined

  const relay = yield* Relay

  while (status?._tag !== 'Complete') {
    status = yield* relay.awaitStatus()

    if (status._tag === 'Close') {
      const defer = yield* F.join(param)

      if (!defer) {
        yield* DisReactDOM.defer(fresh.id, fresh.val, {type: 7})
        yield* DisReactDOM.dismount(fresh.app, fresh.val)
        return
      }

      yield* E.forkAll([
        DisReactDOM.discard(fresh.id, fresh.val, {type: 7}),
        DisReactDOM.dismount(fresh.app, defer.val),
        E.tap(DokenMemory, (memory) => memory.free(defer.id)),
      ])
      return
    }

    if (status._tag === 'Next' && status.id === request.hydrant.id) {
      const defer = yield* F.join(param)

      if (!defer) {
        yield* pipe(
          DisReactDOM.defer(fresh.id, fresh.val, {type: 7}),
          E.tap(() => DF.succeed(final, Doken.makeDeferFromFresh(fresh))),
        )
        break
      }

      yield* pipe(
        DisReactDOM.discard(fresh.id, fresh.val, {type: 7}),
        E.tap(() => DF.succeed(final, defer)),
      )
      break
    }

    if (status._tag === 'Partial') {
      break
    }
  }

  const doken = yield* DF.await(final)
  const root = yield* F.join(model)

  const output = restCodec.encodeResponse([
    {
      base   : RxTx.DEFAULT_BASE_URL,
      doken  : doken,
      hydrant: Fibril.encodeNexus(root.nexus!),
    },
    root.encoded,
  ])

  yield* DisReactDOM.reply(doken.id, doken.val, output)
})

const forkModelInvoke = (request: RxTx.RouteDecoding) => E.flatMap(ElemCodec, (codec) => {
  const event = codec.decodeEvent(request)

  return pipe(
    Model.hydrateInvoke(request.hydrant, event),
    E.map((model) =>
      ({
        nexus  : model?.nexus,
        encoded: codec.encodeRoot(model),
      }),
    ),
    E.fork,
  )
})

const forkResolveDoken = (defer?: Doken.Defer | Doken.Spent | Doken.Cache) =>
  E.fork(
    E.suspend(() => {
      if (!defer || defer._tag === 'Public') {
        return E.succeed(undefined)
      }
      if (defer._tag === 'Defer') {
        return E.succeed(defer)
      }

      return E.flatMap(DokenMemory, (memory) => memory.load(defer.id))
    }),
  )

const cacheFinalDoken = (final: Doken.Defer) =>
  pipe(
    E.tap(DokenMemory, (memory) => memory.save(final)),
    E.fork,
    E.as(Doken.makeCacheFromDefer(final)),
  )

const setupResponseState = (input: any) =>
  pipe(
    RestCodec,
    E.map((codec) => codec.decodeRequest(input)),
    E.flatMap((request) =>
      E.all({
        epoch  : DT.now,
        request: E.succeed(request),
        doken  : DF.make<Doken.Defer | Doken.Spent>(),
        fresh  : E.succeed(request.fresh),
        defer  : forkResolveDoken(request.defer),
        model  : forkModelInvoke(request),
        dom    : DisReactDOM,
      }),
    ),
  )

type State = E.Effect.Success<ReturnType<typeof setupResponseState>>

const forkOnClose = (state: State) => E.tap(F.join(state.defer), (defer) => {
  if (defer) {
    return E.forkAll([
      state.dom.discard(state.fresh.id, state.fresh.val, {type: 7}),
      state.dom.dismount(state.fresh.app, defer.val),
    ])
  }

  return pipe(
    state.dom.defer(state.fresh.id, state.fresh.val, {type: 7}),
    E.fork,
  )
})

// const responder = (input: any) => pipe(
//   setupResponseState(input),
//   E.tap((state) => {
//     const initial = RelayStatus.None()
//
//     const condition = (status: RelayStatus) =>
//       status._tag !== 'Complete'
//       && status._tag !== 'Close'
//
//     let isSame = false
//
//     const onClose = () => pipe(
//       F.join(state.defer),
//       E.tap((defer) => {
//         if (isSame) {
//           return
//         }
//         return
//       }),
//     )
//
//     const onSameNext = (defer?: Doken.Defer) => defer
//       ? pipe(
//         DF.succeed(state.doken, defer),
//         E.tap(() => state.dom.discard(state.fresh.id, state.fresh.val, {type: 7})),
//         E.fork,
//       )
//       : pipe(
//         state.dom.defer(state.fresh.id, state.fresh.val, {type: 7}),
//         E.tap(() => DF.succeed(state.doken, {
//           _tag: 'Defer',
//           id  : state.fresh.id,
//           val : state.fresh.val,
//           ttl : state.fresh.ttl.pipe(DT.addDuration(DR.minutes(14))),
//         } as const)),
//         E.fork,
//       )
//
//     const onNext = (status: D.TaggedEnum.Value<RelayStatus, 'Next'>) => pipe(
//       DF.await(state.defer),
//       E.tap((defer) => {
//         if (status.id === state.request.hydrant.id) {
//           isSame = true
//           return onSameNext(defer)
//         }
//       }),
//     )
//
//     const onPartial = (status: D.TaggedEnum.Value<RelayStatus, 'Partial'>) => {
//
//     }
//
//     const loopBody = RelayStatus.$match({
//       None    : () => {},
//       Handled : () => {},
//       Complete: () => {},
//       Close   : onClose,
//       Next    : onNext,
//       Partial : onPartial,
//     })
//   }),
// )
