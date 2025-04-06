import {Codec} from '#src/disreact/codec/Codec.ts'
import {Doken, makeFreshFromRequest} from '#src/disreact/codec/doken.ts'
import {DF, DT, E, F, O, pipe} from '#src/disreact/utils/re-exports.ts'
import {Fibril} from '#src/disreact/model/comp/fibril.ts'
import {Relay, RelayStatus} from '#src/disreact/model/Relay.ts'
import {DisReactDOM} from '#src/disreact/runtime/DisReactDOM.ts'
import {ExpiryFailure} from '#src/disreact/runtime/DisReactState.ts'
import {DokenMemory} from '#src/disreact/runtime/DokenMemory.ts'
import {Deferred} from 'effect'
import {Model} from '../model/model'

class RespondState extends E.Service<RespondState>()('disreact/RespondState', {
  effect: E.map(
    E.all([
      Deferred.make(),
    ]),
    (state) => {
      return {

      }
    },
  ),
  accessors: true,
}) {}


export const respond = (body: any) => E.gen(function* () {
  const fresh = yield* makeFreshFromRequest(body)
  const params = yield* Codec.decodeRoute(body.message)
  const deferDoken = yield* DF.make<Doken.Defer>()
  const model = yield* E.fork(Model.hydrateInvoke(params.hydrant, body.event))
  const relay = yield* Relay
  const dom = yield* DisReactDOM

  let status: RelayStatus | undefined = undefined

  while (status?._tag !== 'Complete') {
    status = yield* pipe(
      relay.awaitStatus(),
      E.catchTag('NoSuchElementException', () => E.succeed(RelayStatus.Complete())),
    )

    if (status._tag === 'Close') {
      return yield* closeInteraction(fresh, params.doken)
    }

    if (status._tag === 'Next') {
      const param = yield* resolveParamDoken(params.doken)

      if (status.id === params.hydrant.id) {
        if (!param) {
          const defer = yield* Doken.makeOptimizedDeferFromFresh(body, fresh)
          yield* E.fork(E.andThen(DisReactDOM, (dom) => dom.defer(defer.id, defer.val, {type: defer.type})))
          yield* DF.succeed(deferDoken, defer)
        }
        else {
          yield* E.fork(dom.discard(fresh.id, fresh.val, {type: 7}))
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
          E.andThen(DisReactDOM, (dom) =>
            dom.defer(defer.id, defer.val, defer.flag === 2
              ? {type: defer.type, data: {flags: 64}}
              : {type: defer.type}),
          ),
        )
        yield* DF.succeed(deferDoken, defer)
      }
      break
    }
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

  yield* E.andThen(DisReactDOM, (dom) => dom.reply(body.application_id, doken.val, final))
})

const resolveParamDoken = (doken?: Doken) => !doken || doken._tag === 'Spent'
  ? E.succeed(undefined)
  : pipe(
    DT.isPast(doken.ttl),
    E.if({
      onTrue : () => E.succeed(undefined),
      onFalse: () => doken._tag === 'Defer'
        ? E.succeed(undefined)
        : E.andThen(DokenMemory, (memory) => memory.load(doken.id)),
    }),
  )

const closeInteraction = (fresh: Doken.Fresh, defer?: Doken) =>
  pipe(
    DT.isPast(fresh.ttl),
    E.if({
      onTrue : () => E.fail(new ExpiryFailure()),
      onFalse: () => DisReactDOM,
    }),
    E.andThen((dom) => {
      if (!defer || defer._tag === 'Spent') {
        return pipe(
          dom.defer(fresh.id, fresh.val, {type: 7}),
          E.andThen(() => dom.dismount(fresh.app, fresh.val)),
          E.fork,
        )
      }
      if (defer._tag === 'Cache') {
        return pipe(
          dom.defer(fresh.id, fresh.val, {type: 7}),
          E.andThen(() =>
            E.forkAll([
              dom.dismount(fresh.app, fresh.val),
              E.andThen(DokenMemory, (memory) => memory.free(defer.id)),
            ]),
          ),
        )
      }
      return E.forkAll([
        dom.discard(fresh.app, fresh.val, {type: 7}),
        dom.dismount(fresh.app, defer.val),
      ])
    }),
    E.as(undefined),
  )
