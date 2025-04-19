import {DokenMemory} from '#src/disreact/utils/DokenMemory.ts';
import {D, DT, E, hole} from '#src/disreact/utils/re-exports.ts';
import {DR, pipe, S} from '#src/internal/pure/effect.ts';
import {Duration, Either, Option} from 'effect';
import {DateTime} from 'effect';
import { Redacted} from 'effect';
import {Snowflake} from 'src/disreact/codec/snowflake.ts';

export * as Doken from '#src/disreact/codec/rest/doken.ts';
export type Doken =
  | Fresh
  | Active
  | Cached
  | Single
  | Modal
  | Source
  | Update
  | Never;

export const isFresh = (doken: Doken): doken is Fresh => doken._tag === FRESH;
export const isActive = (doken: Doken): doken is Active => doken._tag === ACTIVE;
export const isCached = (doken: Doken): doken is Cached => doken._tag === CACHED;
export const isSingle = (doken: Doken): doken is Single => doken._tag === SINGLE;
export const isModal = (doken: Doken): doken is Modal => doken._tag === MODAL;
export const isSource = (doken: Doken): doken is Source => doken._tag === SOURCE;
export const isUpdate = (doken: Doken): doken is Update => doken._tag === UPDATE;
export const isNever = (doken: Doken): doken is Never => doken._tag === NEVER;

export type Value = Exclude<Doken, Cached>;

export type Create =
  | Modal
  | Source
  | Update;

export type Serial =
  | Single
  | Active
  | Cached;

export const value = (doken: Doken) => Redacted.value(doken.val);

const Base = S.Struct({
  id : Snowflake.Id,
  ttl: S.DateTimeUtcFromSelf,
  val: S.RedactedFromSelf(S.String),
  app: Snowflake.Id,
  eph: S.optional(S.Boolean),
});

export const FRESH_OFFSET = DR.seconds(2);
export const ACTIVE_OFFSET = DR.minutes(12);

export const FRESH = 'Fresh';
export type Fresh = S.Schema.Type<typeof Fresh>;
export const Fresh = pipe(
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
  S.attachPropertySignature('_tag', FRESH),
  S.mutable,
);

export const NEVER = 'Never';
export type Never = typeof Never.Type;
export const Never = pipe(
  Base,
  S.attachPropertySignature('_tag', NEVER),
  S.mutable,
);

export const never = (): Never =>
  ({
    _tag: NEVER,
  } as unknown as Never);

export const MODAL = 'Modal';
export type Modal = typeof Modal.Type;
export const Modal = pipe(
  Base,
  S.attachPropertySignature('_tag', MODAL),
  S.mutable,
);

export const modal = (fresh: Fresh): Modal =>
  ({
    ...fresh,
    _tag: MODAL,
  });

export const SOURCE = 'Source';
export type Source = typeof Source.Type;
export const Source = pipe(
  Base,
  S.attachPropertySignature('_tag', SOURCE),
  S.mutable,
);

export const source = (fresh: Fresh): Source =>
  ({
    ...fresh,
    eph : !fresh.eph,
    _tag: SOURCE,
  });

export const UPDATE = 'Update';
export type Update = typeof Update.Type;
export const Update = pipe(
  Base,
  S.attachPropertySignature('_tag', UPDATE),
  S.mutable,
);

export const update = (fresh: Fresh): Update =>
  ({
    ...fresh,
    _tag: UPDATE,
  });

export const SINGLE = 'Single' as const;
export type Single = typeof Single.Type;
export const Single = pipe(
  S.TemplateLiteralParser(
    's',
  ),
  S.transform(
    Base,
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
          app: '',
        }),
    },
  ),
  S.attachPropertySignature('_tag', SINGLE),
  S.mutable,
);

export const single = (doken: Doken): Single =>
  ({
    ...doken,
    _tag: SINGLE,
  });

export const synthetic = (): Single =>
  ({
    _tag: SINGLE,
    id  : 'synthetic',
    ttl : DT.unsafeMake(0),
    val : Redacted.make(''),
    app : '',
  });

export const ACTIVE = 'Active';
export type Active = typeof Active.Type;
export const Active = pipe(
  S.TemplateLiteralParser(
    'a/', Snowflake.Id,
    '/', S.Redacted(S.String),
  ),
  S.transform(
    S.Struct({
      ...Base.fields,
      ttl: Snowflake.TimeToLive(ACTIVE_OFFSET),
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
          app: '',
        }),
    },
  ),
  S.attachPropertySignature('_tag', ACTIVE),
  S.mutable,
);

export const active = (doken: Doken): Active => {
  if (doken._tag === 'Fresh') {
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

export const CACHED = 'Cached';
export type Cached = typeof Cached.Type;
export const Cached = pipe(
  S.TemplateLiteralParser(
    'c/', Snowflake.Id,
  ),
  S.transform(
    S.Struct({
      ...Base.fields,
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
          val: Redacted.make(''),
          app: '',
        }),
    },
  ),
  S.attachPropertySignature('_tag', CACHED),
  S.mutable,
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

export const convertSerial = (doken: Doken): Serial => {
  switch (doken._tag) {
    case ACTIVE:
      return doken;
    case SINGLE:
      return doken;
    case CACHED:
      return doken;
    default:
      return single(doken);
  }
};

export const convertCached = (doken: Serial): Serial => {
  switch (doken._tag) {
    case ACTIVE:
      return cache(doken);
    default:
      return doken;
  }
};

export class DokenDefect extends D.TaggedError('disreact/DokenDefect')<{
  msg?: string;
}> {}

export const ttlEither = (self: Doken | undefined, now: DateTime.Utc) =>
  pipe(
    self,
    Either.fromNullable(() => undefined),
    Either.flatMap((doken) =>
      DateTime.distanceDurationEither(now, doken.ttl),
    ),
    Either.map((delay) => [delay, self!] as const),
    Either.mapLeft(() => undefined),
  );

export const reduce = (state: Doken, action: Doken) => {
  if (action._tag === NEVER) {
    return action;
  }
  if (
    state._tag === NEVER ||
    state._tag === ACTIVE ||
    state._tag === MODAL
  ) {
    return state;
  }
  if (
    state._tag === FRESH
  ) {
    return action;
  }
};

export const resolveSerial = (fresh: Doken.Fresh, serial?: Doken.Serial) => {
  if (!serial || Doken.isSingle(serial)) {
    return E.succeed(undefined);
  }
  if (Doken.isActive(serial)) {
    return pipe(
      DateTime.isFuture(serial.ttl),
      E.map((isFuture) => isFuture ? serial : undefined),
    );
  }
  return pipe(
    DokenMemory.use((memory) => memory.load(serial.id)),
    E.orElseSucceed(() => undefined),
    E.timeoutTo({
      duration : Duration.seconds(1),
      onTimeout: () => undefined,
      onSuccess: (cached) => {
        if (!cached) {
          return cached;
        }
        cached.app = fresh.app;
        return cached;
      },
    }),
    E.whenEffect(DateTime.isFuture(serial.ttl)),
    E.map(Option.getOrUndefined),
  );
};
