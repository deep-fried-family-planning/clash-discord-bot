import {DT, hole} from '#src/disreact/utils/re-exports.ts';
import {DR, pipe, S} from '#src/internal/pure/effect.ts';
import {Redacted} from 'effect';
import {Snowflake} from './snowflake';

export * as Doken from '#src/disreact/codec/doken.ts';
export type Doken =
  | Fresh
  | Active
  | Cached
  | Single;

export const FRESH_OFFSET = DR.seconds(2);
export const ACTIVE_OFFSET = DR.minutes(12);

export const FRESH = 'Fresh';
export type Fresh = S.Schema.Type<typeof Fresh>;
export const Fresh = pipe(
  S.Struct({
    id            : Snowflake.Id,
    token         : S.RedactedFromSelf(S.String),
    application_id: Snowflake.Id,
  }),
  S.transform(
    S.Struct({
      id : Snowflake.Id,
      ttl: Snowflake.TimeToLive(FRESH_OFFSET),
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
  S.attachPropertySignature('_tag', FRESH),
  S.mutable,
);

export const ACTIVE = 'Active';
export type Active = typeof Active.Type;
export const Active = pipe(
  S.TemplateLiteralParser(
    'a/', Snowflake.Id,
    '/', S.Redacted(S.String),
  ),
  S.transform(
    S.Struct({
      id : Snowflake.Id,
      ttl: Snowflake.TimeToLive(ACTIVE_OFFSET),
      val: S.RedactedFromSelf(S.String),
    }),
    {
      encode: ({id, val}) =>
        [
          'a/', id, '/', val,
        ] as const,
      decode: ([, id, , val]) =>
        ({
          id : id,
          ttl: id,
          val: val,
        }),
    },
  ),
  S.attachPropertySignature('_tag', ACTIVE),
  S.mutable,
);

export const makeActive = (fresh: Fresh): Active =>
  ({
    _tag: ACTIVE,
    id  : fresh.id,
    ttl : fresh.ttl.pipe(DT.addDuration(ACTIVE_OFFSET)),
    val : fresh.val,
  });

export const CACHED = 'Cached';
export type Cached = typeof Cached.Type;
export const Cached = pipe(
  S.TemplateLiteralParser(
    'c/', Snowflake.Id,
  ),
  S.transform(
    S.Struct({
      id : Snowflake.Id,
      ttl: Snowflake.TimeToLive(ACTIVE_OFFSET),
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
  S.attachPropertySignature('_tag', CACHED),
  S.mutable,
);

export const makeCached = (defer: Active): Cached =>
  ({
    _tag: CACHED,
    id  : defer.id,
    ttl : defer.ttl,
  });

export const SINGLE = 'Single' as const;
export type Single = typeof Single.Type;
export const Single = pipe(
  S.TemplateLiteralParser(
    's',
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
          's',
        ] as const,
      decode: () =>
        ({
          id : '',
          ttl: DT.unsafeMake(0),
          val: Redacted.make(''),
        }),
    },
  ),
  S.attachPropertySignature('_tag', SINGLE),
  S.mutable,
);

export const makeSingle = (fresh: Fresh): Single =>
  ({
    _tag: SINGLE,
    id  : fresh.id,
    ttl : fresh.ttl,
    val : fresh.val,
  });

export const makeEmptySingle = (): Single =>
  ({
    _tag: SINGLE,
    id  : 'synthesized',
    ttl : DT.unsafeMake(0),
    val : Redacted.make(''),
  });

export type Serial = typeof Serial.Type;
export const Serial = S.Union(Active, Cached, Single);
