import {UtcNow} from '#src/disreact/codec/rest/shared.ts'
import {RDT} from '#src/disreact/codec/re-exports.ts'
import {DokenMemory} from '#src/disreact/runtime/DokenMemory.ts'
import {DR, DT, E, pipe, S} from '#src/internal/pure/effect.ts'
import {DateTime, ParseResult} from 'effect'
import {DateTimeUtcFromNumber, DateTimeUtcFromSelf, RedactedFromSelf} from 'effect/Schema'
import {CallbackType} from 'src/disreact/codec/rest/callback-type.ts'
import {Flag} from 'src/disreact/codec/rest/flag.ts'
import { DAPIIX} from 'src/disreact/codec/rest/dapi-ix.ts'


export type Fresh = typeof Fresh.T.Type

export namespace Fresh {
  export const TAG = 'Fresh' as const

  export const T = S.Struct({
    app : S.String,
    id  : S.String,
    val : RedactedFromSelf(S.String),
    type: CallbackType.All,
    flag: Flag.All,
    ttl : UtcNow,
  }).pipe(S.attachPropertySignature('_tag', TAG))

  export const FromRequest = S.transformOrFail(DAPIIX.BaseBody, T, {
    strict: true,
    decode: (request) =>
      pipe(
        DateTime.now,
        E.map((now) =>
          ({
            app : request.application_id,
            id  : request.id,
            type: CallbackType.FRESH,
            flag: Flag.FRESH,
            val : request.token,
            ttl : DateTime.add(now, {millis: 2000}),
          } as const),
        ),
      ),
    encode: () => {throw new Error()},
  })
}

export type Defer = typeof Defer.T.Type

export namespace Defer {
  export type Maybe = typeof Maybe.Type

  export const TAG = 'Defer' as const

  export const T = S.Struct({
    _tag: S.tag(TAG),
    id  : S.String,
    val : RedactedFromSelf(S.String),
    type: CallbackType.Defer,
    flag: Flag.Defined,
    ttl : DateTimeUtcFromSelf,
  })

  export const A = S.TemplateLiteralParser(
    'd/', CallbackType.Defer,
    '/', Flag.Defined,
    '/', S.String,
    '/', DateTimeUtcFromNumber,
    '/', S.Redacted(S.String),
  )

  export const D = S.transform(A, T, {
    strict: true,
    decode: ([, type, , flag, , id, , ttl, , val]) =>
      ({
        _tag: TAG,
        id,
        type,
        flag,
        ttl,
        val,
      }),
    encode: ({id, type, flag, ttl, val}) =>
      [
        'd/', type, '/', flag, '/', id, '/', ttl, '/', val,
      ] as const,
  })

  export const Maybe = S.UndefinedOr(T)
}


export type Cache = typeof Cache.T.Type

export namespace Cache {
  export const TAG = 'Cache' as const

  export const T = S.Struct({
    _tag: S.tag(TAG),
    id  : S.String,
    type: CallbackType.Defer,
    flag: Flag.Defined,
    ttl : DateTimeUtcFromSelf,
  })

  export const A = S.TemplateLiteralParser(
    'c/', CallbackType.Defer,
    '/', Flag.Defined,
    '/', S.String,
    '/', DateTimeUtcFromNumber,
  )

  export const D = S.transform(A, T, {
    strict: true,
    decode: ([, type, , flag, , id, , ttl]) =>
      ({
        _tag: TAG,
        id,
        type,
        flag,
        ttl,
      }),
    encode: ({id, type, flag, ttl}) =>
      [
        'c/', type, '/', flag, '/', id, '/', ttl,
      ] as const,
  })

  // export const FromDefer = S.transformOrFail(Defer.T, T, {
  //   strict: true,
  //   decode: (defer) =>
  //     pipe(
  //       DokenMemory.save(defer),
  //       E.catchAll(() => E.fail(new ParseResult.Unexpected(undefined))),
  //       E.map(() =>
  //         ({
  //           _tag: TAG,
  //           id  : defer.id,
  //           type: defer.type,
  //           flag: defer.flag,
  //           ttl : defer.ttl,
  //         }),
  //       ),
  //     ),
  //   encode: () => {throw new Error()},
  // })
}


export type Spent = typeof Spent.T.Type

export namespace Spent {
  export type Spent = typeof T.Type
  export const TAG = 'Spent' as const

  export const T = S.Struct({
    _tag: S.tag(TAG),
    id  : S.String,
    type: CallbackType.Spent,
    flag: Flag.Defined,
    val : RedactedFromSelf(S.String),
  })

  export const A = S.TemplateLiteralParser(
    's/', CallbackType.Spent,
    '/', Flag.Defined,
    '/', S.String,
  )

  export const D = S.transform(A, T, {
    strict: true,
    decode: ([, type, , flag, , id]) =>
      ({
        _tag: TAG,
        id,
        type,
        flag,
        val : RDT.make('-'),
      }),
    encode: ({id, type, flag}) =>
      [
        's/', type, '/', flag, '/', id,
      ] as const,
  })

  export const FromFresh = S.transform(Fresh.T, T, {
    strict: true,
    decode: (fresh) =>
      ({
        _tag: TAG,
        id  : fresh.id,
        type: fresh.type as any,
        flag: fresh.flag as any,
        val : fresh.val,
      }),
    encode: () => {throw new Error()},
  })
}


export * as Doken from '#src/disreact/codec/doken.ts'
export type Doken = typeof T.Type

export const T = S.Union(
  Defer.T,
  Cache.T,
  Spent.T,
  // Fresh.T.pipe(S.attachPropertySignature('_tag', Fresh.TAG)),
)

export const A = S.Union(
  Defer.A,
  Cache.A,
  Spent.A,
)

export const D = S.Union(
  Defer.D,
  Cache.D,
  Spent.D,
)

export const makeFreshFromRequest = (request: DAPIIX.Body, startMs?: number): E.Effect<Fresh> =>
  pipe(
    startMs
      ? E.succeed(DT.unsafeMake(startMs))
      : DT.now,
    E.map((now) =>
      ({
        _tag: 'Fresh',
        app : request.application_id,
        id  : request.id,
        type: CallbackType.FRESH,
        flag: Flag.FRESH,
        val : RDT.isRedacted(request.token) ? request.token : RDT.make(request.token),
        ttl : DateTime.add(now, {millis: 2000}),
      }),
    ),
  )

export const makeOptimizedDeferFromFresh = (request: DAPIIX.Body, fresh: Fresh) =>
  pipe(
    DT.isPast(fresh.ttl),
    E.andThen((isPast) => {
      if (isPast) {
        return E.fail(new ParseResult.Unexpected('Expired'))
      }
      return E.succeed({
        _tag: 'Defer',
        id  : fresh.id,
        type: CallbackType.UPDATE_DEFER,
        flag: request.message?.flags === 64 ? Flag.PRIVATE : Flag.PUBLIC,
        ttl : DT.addDuration(fresh.ttl, DR.minutes(12)),
        val : fresh.val,
      } satisfies Defer)
    }),
  )

export const makeDeferFromFresh = (request: DAPIIX.Body, fresh: Fresh, flags?: number) =>
  pipe(
    DT.isPast(fresh.ttl),
    E.andThen((isPast) => {
      if (isPast) {
        return E.fail(new ParseResult.Unexpected('Expired'))
      }
      const msgFlags = request.message?.flags === 64 ? 2 : 1
      return E.succeed({
        _tag: 'Defer',
        id  : fresh.id,
        type: flags === msgFlags ? CallbackType.UPDATE_DEFER : CallbackType.SOURCE_DEFER,
        flag: flags as any ?? 2,
        ttl : DT.addDuration(fresh.ttl, DR.minutes(12)),
        val : RDT.isRedacted(fresh.val) ? fresh.val : RDT.make(fresh.val),
      } satisfies Defer)
    }),
  )
