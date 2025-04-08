import {DT, hole} from '#src/disreact/utils/re-exports.ts';
import {DR, pipe, S} from '#src/internal/pure/effect.ts';
import {Redacted} from 'effect';
import {fresh} from 'effect/Layer';
import {Snowflake} from './snowflake';

export * as Doken from '#src/disreact/codec/doken.ts';
export type Doken =
  | Fresh
  | Active
  | Cached
  | Single
  | Modal
  | Source
  | Update;

export type Value =
  | Modal
  | Fresh
  | Active
  | Single
  | Source
  | Update;

export type Create =
  | Modal
  | Source
  | Update;

export type Serial =
  | Single
  | Active
  | Cached;

export const value = (doken: Value) => Redacted.value(doken.val);

const Base = S.Struct({
  id : Snowflake.Id,
  ttl: S.DateTimeUtcFromSelf,
  val: S.RedactedFromSelf(S.String),
  app: Snowflake.Id,
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

export const MODAL = 'Modal';
export type Modal = typeof Modal.Type;
export const Modal = pipe(
  Base,
  S.attachPropertySignature('_tag', MODAL),
  S.mutable,
);

export const makeModal = (fresh: Fresh): Modal =>
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

export const makeSource = (fresh: Fresh): Source =>
  ({
    ...fresh,
    _tag: SOURCE,
  });

export const UPDATE = 'Update';
export type Update = typeof Update.Type;
export const Update = pipe(
  Base,
  S.attachPropertySignature('_tag', UPDATE),
  S.mutable,
);

export const makeUpdate = (fresh: Fresh): Update =>
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

export const makeSingle = (doken: Doken): Single =>
  ({
    ...doken,
    _tag: SINGLE,
  });

export const makeSingleModal = (modal: Modal): Single =>
  ({
    ...modal,
    _tag: SINGLE,
  });

export const makeSyntheticSingle = (): Single =>
  ({
    _tag: SINGLE,
    id  : 'synthesized',
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

export const makeActive = (fresh: Fresh): Active =>
  ({
    ...fresh,
    _tag: ACTIVE,
    ttl : fresh.ttl.pipe(DT.addDuration(ACTIVE_OFFSET)),
  });

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

export const makeCached = (doken: Doken): Cached =>
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
      return makeSingle(doken);
  }
};

export const convertCached = (doken: Serial): Serial => {
  switch (doken._tag) {
    case ACTIVE:
      return makeCached(doken);
    default:
      return doken;
  }
};
