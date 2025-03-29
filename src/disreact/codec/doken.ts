import {UtcNow} from '#src/disreact/codec/rest/shared.ts'
import {DokenMem} from '#src/disreact/DokenCache.ts'
import {E, pipe, S} from '#src/internal/pure/effect.ts'
import {DateTime, ParseResult} from 'effect'
import {DateTimeUtcFromNumber, DateTimeUtcFromSelf, RedactedFromSelf} from 'effect/Schema'
import {CallbackType} from 'src/disreact/codec/rest/callback-type.ts'
import {Flag} from 'src/disreact/codec/rest/flag.ts'
import { DAPIIX } from 'src/disreact/codec/rest/dapi-ix.ts'


export type Fresh = typeof Fresh.T.Type

export namespace Fresh {
  export const TAG = 'Fresh' as const

  export const T = S.Struct({
    id  : S.String,
    val : RedactedFromSelf(S.String),
    type: CallbackType.All,
    flag: Flag.All,
    ttl : UtcNow,
  })

  export const FromRequest = S.transformOrFail(DAPIIX.Body, T, {
    strict: true,
    decode: (request) =>
      pipe(
        DateTime.now,
        E.map((now) =>
          ({
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

  export const FromDefer = S.transformOrFail(Defer.T, T, {
    strict: true,
    decode: (defer) =>
      pipe(
        DokenMem.save(defer),
        E.catchAll(() => E.fail(new ParseResult.Unexpected(undefined))),
        E.map(() =>
          ({
            id  : defer.id,
            type: defer.type,
            flag: defer.flag,
            ttl : defer.ttl,
          }),
        ),
      ),
    encode: () => {throw new Error()},
  })
}


export type Spent = typeof Spent.T.Type

export namespace Spent {
  export type Spent = typeof T.Type
  export const TAG = 'Spent' as const

  export const T = S.Struct({
    id  : S.String,
    type: CallbackType.Spent,
    flag: Flag.Defined,
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
        id,
        type,
        flag,
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
        id  : fresh.id,
        type: fresh.type as any,
        flag: fresh.flag as any,
      }),
    encode: () => {throw new Error()},
  })
}


export * as Doken from '#src/disreact/codec/doken.ts'
export type Doken = typeof T.Type

export const T = S.Union(
  Defer.T.pipe(S.attachPropertySignature('_tag', Defer.TAG)),
  Cache.T.pipe(S.attachPropertySignature('_tag', Cache.TAG)),
  Spent.T.pipe(S.attachPropertySignature('_tag', Spent.TAG)),
  // Fresh.T.pipe(S.attachPropertySignature('_tag', Fresh.TAG)),
)

export const A = S.Union(
  Defer.A,
  Cache.A,
  Spent.A,
)

export const D = S.Union(
  Defer.D.pipe(S.attachPropertySignature('_tag', Defer.TAG)),
  Cache.D.pipe(S.attachPropertySignature('_tag', Cache.TAG)),
  Spent.D.pipe(S.attachPropertySignature('_tag', Spent.TAG)),
)
