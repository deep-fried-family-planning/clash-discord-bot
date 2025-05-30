import {Snowflake} from '#src/disreact/codec/dapi/snowflake.ts';
import * as DateTime from 'effect/DateTime';
import * as Duration from 'effect/Duration';
import * as E from 'effect/Effect';
import * as Either from 'effect/Either';
import {hole, pipe} from 'effect/Function';
import * as Option from 'effect/Option';
import * as Redacted from 'effect/Redacted';
import * as S from 'effect/Schema';

export * as Doken from '#src/disreact/codec/rest/doken.ts';

export type Latest = S.mutable<typeof Latest>['Type'];
export type Active = S.mutable<typeof Active>['Type'];
export type Cached = S.mutable<typeof Cached>['Type'];
export type Single = S.mutable<typeof Single>['Type'];
export type Dialog = S.mutable<typeof Dialog>['Type'];
export type Source = S.mutable<typeof Source>['Type'];
export type Update = S.mutable<typeof Update>['Type'];
export type Never = S.mutable<typeof Never>['Type'];
export type Doken = | Latest
                    | Active
                    | Cached
                    | Single
                    | Dialog
                    | Source
                    | Update
                    | Never;

export const LATEST = 'Latest' as const,
             ACTIVE = 'Active' as const,
             CACHED = 'Cached' as const,
             SINGLE = 'Single' as const,
             SOURCE = 'Source' as const,
             DIALOG = 'Modal' as const,
             UPDATE = 'Update' as const,
             NEVER  = 'Never' as const;

export const isLatest = (doken?: Doken): doken is Latest => doken?._tag === LATEST;
export const isActive = (doken?: Doken): doken is Active => doken?._tag === ACTIVE;
export const isCached = (doken?: Doken): doken is Cached => doken?._tag === CACHED;
export const isSingle = (doken?: Doken): doken is Single => doken?._tag === SINGLE;
export const isDialog = (doken?: Doken): doken is Dialog => doken?._tag === DIALOG;
export const isSource = (doken?: Doken): doken is Source => doken?._tag === SOURCE;
export const isUpdate = (doken?: Doken): doken is Update => doken?._tag === UPDATE;
export const isNever = (doken?: Doken): doken is Never => doken?._tag === NEVER;

export const FRESH_OFFSET = Duration.seconds(2);
export const ACTIVE_OFFSET = Duration.minutes(12);

const Base = S.Struct({
  id : Snowflake.Id,
  ttl: S.DateTimeUtcFromSelf,
  val: S.RedactedFromSelf(S.String),
  app: Snowflake.Id,
  eph: S.optional(S.Boolean),
});

export const Latest = pipe(
  S.Struct({
    id            : Snowflake.Id,
    token         : S.RedactedFromSelf(S.String),
    application_id: Snowflake.Id,
    message       : S.optional(S.Struct({flags: S.optional(S.Number)})),
  }),
  S.transform(
    S.Struct({
      ...Base.fields,
      ttl: Snowflake.TimeToLive(FRESH_OFFSET),
      val: S.RedactedFromSelf(S.String),
    }),
    {
      encode: hole,
      decode: (req) =>
        ({
          id : req.id,
          ttl: req.id,
          val: req.token,
          app: req.application_id,
          eph: req.message?.flags === 64,
        }),
    },
  ),
  S.attachPropertySignature('_tag', LATEST),
);

export const Single = pipe(
  S.TemplateLiteralParser('s'),
  S.transform(
    Base,
    {
      encode: () => ['s'] as const,
      decode: () =>
        ({
          id : '',
          ttl: DateTime.unsafeMake(0),
          val: Redacted.make(''),
          app: '',
        }),
    },
  ),
  S.attachPropertySignature('_tag', SINGLE),
);

export const single = (doken: Doken): Single =>
  ({
    ...doken,
    _tag: SINGLE,
  });

export const Active = pipe(
  S.TemplateLiteralParser('a/', Snowflake.Id, '/', S.Redacted(S.String)),
  S.transform(
    S.TaggedStruct(ACTIVE, {
      ...Base.fields,
      ttl: Snowflake.TimeToLive(ACTIVE_OFFSET),
    }),
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
  ),
);

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

export type Create =
  | Dialog
  | Source
  | Update;

export type Serial =
  | Single
  | Active
  | Cached;

export const Never = pipe(
  Base,
  S.attachPropertySignature('_tag', NEVER),
);

export const never = (): Never =>
  ({
    _tag: NEVER,
  } as unknown as Never);

export const Dialog = pipe(
  Base,
  S.attachPropertySignature('_tag', DIALOG),
);

export const dialog = (fresh: Latest): Dialog =>
  ({
    ...fresh,
    _tag: DIALOG,
  });

export const Source = pipe(
  Base,
  S.attachPropertySignature('_tag', SOURCE),
);

export const source = (fresh: Latest): Source =>
  ({
    ...fresh,
    eph : !fresh.eph,
    _tag: SOURCE,
  });

export const Update = pipe(
  Base,
  S.attachPropertySignature('_tag', UPDATE),
);

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

export const Cached = pipe(
  S.TemplateLiteralParser('c/', Snowflake.Id),
  S.transform(
    S.Struct({
      ...Base.fields,
      ttl: Snowflake.TimeToLive(ACTIVE_OFFSET),
    }),
    {
      encode: ({id}) => ['c/', id] as const,
      decode: ([, id]) =>
        ({
          id : id,
          ttl: id,
          val: Redacted.make(''),
          app: '',
        }),
    },
  ),
  S.attachPropertySignature('_tag', CACHED),
);

export const cache = (doken: Doken): Cached =>
  ({
    ...doken,
    _tag: CACHED,
  });

export const Serial = S.Union(
  Active,
  Cached,
  Single,
);

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
