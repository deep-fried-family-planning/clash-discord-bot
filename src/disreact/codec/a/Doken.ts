import {Snowflake} from '#disreact/a/codec/dapi/snowflake.ts';
import * as DateTime from 'effect/DateTime';
import * as Duration from 'effect/Duration';
import * as E from 'effect/Effect';
import * as Either from 'effect/Either';
import {hole, pipe} from 'effect/Function';
import * as Option from 'effect/Option';
import * as Redacted from 'effect/Redacted';
import * as S from 'effect/Schema';

export type Latest = S.mutable<typeof Latest>['Type'];
export type Active = S.mutable<typeof Active>['Type'];
export type Cached = S.mutable<typeof Cached>['Type'];
export type Single = S.mutable<typeof Single>['Type'];
export type Dialog = S.mutable<typeof Dialog>['Type'];
export type Source = S.mutable<typeof Source>['Type'];
export type Update = S.mutable<typeof Update>['Type'];
export type Serial = | Single
                     | Active
                     | Cached;
export type Doken = | Latest
                    | Active
                    | Cached
                    | Single
                    | Dialog
                    | Source
                    | Update;

export const LATEST = 'Latest' as const,
             ACTIVE = 'Active' as const,
             CACHED = 'Cached' as const,
             SINGLE = 'Single' as const,
             DIALOG = 'Modal' as const,
             SOURCE = 'Source' as const,
             UPDATE = 'Update' as const;

export const isLatest = (doken?: Doken): doken is Latest => doken?._tag === LATEST,
             isActive = (doken?: Doken): doken is Active => doken?._tag === ACTIVE,
             isCached = (doken?: Doken): doken is Cached => doken?._tag === CACHED,
             isSingle = (doken?: Doken): doken is Single => doken?._tag === SINGLE,
             isDialog = (doken?: Doken): doken is Dialog => doken?._tag === DIALOG,
             isSource = (doken?: Doken): doken is Source => doken?._tag === SOURCE,
             isUpdate = (doken?: Doken): doken is Update => doken?._tag === UPDATE;

export const FRESH_OFFSET  = Duration.seconds(2),
             ACTIVE_OFFSET = Duration.minutes(12);

export const single = (doken: Doken): Single =>
  ({
    ...doken,
    _tag: SINGLE,
  });

export const active = (doken: Doken): Active => {
  if (isLatest(doken)) {
    return {
      ...doken,
      _tag: ACTIVE,
      ttl : DateTime.addDuration(doken.ttl, ACTIVE_OFFSET),
    };
  }
  return {
    ...doken,
    _tag: ACTIVE,
  };
};

export const cached = (doken: Doken): Cached =>
  ({
    ...doken,
    _tag: CACHED,
  });

export const dialog = (fresh: Latest): Dialog =>
  ({
    ...fresh,
    _tag: DIALOG,
  });

export const source = (fresh: Latest): Source =>
  ({
    ...fresh,
    eph : !fresh.eph,
    _tag: SOURCE,
  });

export const update = (fresh: Latest): Update =>
  ({
    ...fresh,
    _tag: UPDATE,
  });

export const synthetic = (): Single =>
  ({
    _tag: SINGLE,
    id  : 'synthetic',
    ttl : DateTime.unsafeMake(0),
    val : Redacted.make(''),
    app : '',
  });

export const convert = (doken: Doken): Serial => {
  switch (doken._tag) {
    case ACTIVE:
    case SINGLE:
    case CACHED:
      return doken;
    default:
      return single(doken);
  }
};

export const value = (dk: Doken) => Redacted.value(dk.val);

export const ttl = (dk: Doken | undefined, now: DateTime.Utc) =>
  pipe(
    Option.fromNullable(dk),
    Option.map((dk) => dk.ttl),
    Option.map((then) => DateTime.distanceDurationEither(now, then)),
    Option.map((dis) => Either.getOrUndefined(dis)),
    Option.getOrUndefined,
  );

export const ttlEffect = (dk?: Doken, utc?: DateTime.Utc) =>
  pipe(
    Option.fromNullable(dk),
    Option.map((dk) => dk.ttl),
    Option.map((then) =>
      pipe(
        Option.fromNullable(utc),
        Option.map((now) => DateTime.distanceDurationEither(now, then)),
        Option.map((dis) => Either.getOrUndefined(dis)),
        Option.map((ttl) => E.succeed(ttl)),
        Either.fromOption(() => then),
        Either.flip,
      ),
    ),
    Option.map(Either.map((then) =>
      pipe(
        DateTime.now,
        E.map((now) => DateTime.distanceDurationEither(now, then)),
        E.map((dis) => Either.getOrUndefined(dis)),
      ),
    )),
    Option.map(Either.merge),
    Option.getOrElse(() => E.succeed(undefined as undefined | Duration.Duration)),
  );

const Base = S.Struct({
  id : Snowflake.Id,
  ttl: S.DateTimeUtcFromSelf,
  val: S.RedactedFromSelf(S.String),
  app: Snowflake.Id,
  eph: S.optional(S.Boolean),
});

export const Latest = S.TaggedStruct(LATEST, {
  ...Base.fields,
  ttl: Snowflake.TimeToLive(FRESH_OFFSET),
  val: S.RedactedFromSelf(S.String),
});

export const Single = S.TaggedStruct(SINGLE, Base.fields);

export const Active = S.TaggedStruct(ACTIVE, {
  ...Base.fields,
  ttl: Snowflake.TimeToLive(ACTIVE_OFFSET),
});

export const Cached = S.TaggedStruct(CACHED, {
  ...Base.fields,
  ttl: Snowflake.TimeToLive(ACTIVE_OFFSET),
});

export const Dialog = S.TaggedStruct(DIALOG, Base.fields);

export const Source = S.TaggedStruct(SOURCE, Base.fields);

export const Update = S.TaggedStruct(UPDATE, Base.fields);

export const LatestFromRequest = S.transform(
  S.Struct({
    id            : Snowflake.Id,
    token         : S.RedactedFromSelf(S.String),
    application_id: Snowflake.Id,
    message       : S.optional(S.Struct({flags: S.optional(S.Number)})),
  }),
  Latest,
  {
    encode: hole,
    decode: (req) =>
      ({
        _tag: LATEST,
        id  : req.id,
        ttl : req.id,
        val : req.token,
        app : req.application_id,
        eph : req.message?.flags === 64,
      }),
  },
);

export const SingleFromTemplate = S.transform(
  S.TemplateLiteralParser('s'),
  Single,
  {
    encode: () => ['s'] as const,
    decode: () => synthetic(),
  },
);

export const ActiveFromTemplate = S.transform(
  S.TemplateLiteralParser('a/', Snowflake.Id, '/', S.Redacted(S.String)),
  Active,
  {
    encode: ({id, val}) => ['a/', id, '/', val] as const,
    decode: ([, id, , val]) =>
      ({
        _tag: ACTIVE,
        id  : id,
        ttl : id,
        val : val,
        app : '',
      }),
  },
);

export const CachedFromTemplate = S.transform(
  S.TemplateLiteralParser('c/', Snowflake.Id),
  Cached,
  {
    encode: ({id}) => ['c/', id] as const,
    decode: ([, id]) =>
      ({
        _tag: CACHED,
        id  : id,
        ttl : id,
        val : Redacted.make(''),
        app : '',
      }),
  },
);

export const Serial = S.Union(
  ActiveFromTemplate,
  CachedFromTemplate,
  SingleFromTemplate,
);
