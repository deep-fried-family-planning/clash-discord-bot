import {DokenMemory} from '#src/disreact/codec/DokenMemory.ts'
import {DT, E, hole} from '#src/disreact/utils/re-exports.ts'
import {DR, pipe, S} from '#src/internal/pure/effect.ts'
import {Redacted} from 'effect'
import {Snowflake} from './snowflake'

export * as Doken from '#src/disreact/codec/doken.ts'
export type Doken =
  | Fresh
  | Defer
  | Cache
  | Spent

export type Fresh = typeof Fresh.Type
export const Fresh = pipe(
  S.Struct({
    id            : Snowflake.Id,
    token         : S.RedactedFromSelf(S.String),
    application_id: Snowflake.Id,
  }),
  S.transform(
    S.Struct({
      id : Snowflake.Id,
      ttl: Snowflake.TimeToLive(DR.seconds(2)),
      val: S.RedactedFromSelf(S.String),
      app: Snowflake.Id,
    }),
    {
      encode: hole,
      decode: (req) =>
        ({
          id : req.id,
          ttl: req.id,
          val: req.token,
          app: req.application_id,
        }),
    },
  ),
  S.attachPropertySignature('_tag', 'Fresh'),
  S.mutable,
)

export type Defer = typeof Defer.Type
export const Defer = pipe(
  S.TemplateLiteralParser(
    'd/', Snowflake.Id,
    '/', S.Redacted(S.String),
  ),
  S.transform(
    S.Struct({
      id : Snowflake.Id,
      ttl: Snowflake.TimeToLive(DR.minutes(14)),
      val: S.RedactedFromSelf(S.String),
    }),
    {
      encode: ({id, val}) =>
        [
          'd/', id, '/', val,
        ] as const,
      decode: ([, id, , val]) =>
        ({
          id : id,
          ttl: id,
          val: val,
        }),
    },
  ),
  S.attachPropertySignature('_tag', 'Defer'),
  S.mutable,
)

export type Cache = typeof Cache.Type
export const Cache = pipe(
  S.TemplateLiteralParser(
    'c/', Snowflake.Id,
  ),
  S.transform(
    S.Struct({
      id : Snowflake.Id,
      ttl: Snowflake.TimeToLive(DR.minutes(14)),
    }),
    {
      encode: ({id}) =>
        [
          'c/', id,
        ] as const,
      decode: ([, id]) =>
        ({
          id : id,
          ttl: id,
        }),
    },
  ),
  S.attachPropertySignature('_tag', 'Cache'),
  S.mutable,
)

export type Spent = typeof Spent.Type
export const Spent = pipe(
  S.TemplateLiteralParser(
    's/',
  ),
  S.transform(
    S.Struct({
      id : Snowflake.Id,
      ttl: S.DateTimeUtcFromSelf,
      val: S.RedactedFromSelf(S.String),
    }),
    {
      encode: () =>
        [
          's/',
        ] as const,
      decode: () =>
        ({
          id : '',
          ttl: DT.unsafeMake(0),
          val: Redacted.make(''),
        }),
    },
  ),
  S.attachPropertySignature('_tag', 'Spent'),
  S.mutable,
)

export type Serial = typeof Serial.Type
export const Serial = S.Union(Defer, Cache, Spent)

export const makeDeferFromFresh = (fresh: Fresh): Defer =>
  ({
    _tag: 'Defer',
    id  : fresh.id,
    ttl : fresh.ttl.pipe(DT.addDuration(DR.minutes(14))),
    val : fresh.val,
  })

export const makeSpentFromFresh = (fresh: Fresh): Spent =>
  ({
    _tag: 'Spent',
    id  : fresh.id,
    ttl : fresh.ttl,
    val : fresh.val,
  })

export const makeCacheFromDefer = (defer: Defer): Cache =>
  ({
    _tag: 'Cache',
    id  : defer.id,
    ttl : defer.ttl,
  })

export const resolveSerialDoken = (serial?: Defer | Cache | Spent) => {
  if (!serial || serial._tag === 'Spent') {
    return E.succeed(undefined)
  }

  if (serial._tag === 'Defer') {
    return E.succeed(serial)
  }

  return E.flatMap(DokenMemory, (memory) => memory.load(serial.id))
}
