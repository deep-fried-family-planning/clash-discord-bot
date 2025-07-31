import type {Base} from '#disreact/adaptor/codec/dapi/dapi-message.ts';
import * as Snowflake from '#disreact/rest/schema/Snowflake.ts';
import type {Discord} from 'dfx';
import * as DateTime from 'effect/DateTime';
import * as Effect from 'effect/Effect';
import * as Either from 'effect/Either';
import {pipe} from 'effect/Function';
import * as Option from 'effect/Option';
import * as Redacted from 'effect/Redacted';
import * as Schema from 'effect/Schema';

export const DIALOG = 'Dialog' as const,
             SOURCE = 'Source' as const,
             UPDATE = 'Update' as const;

export type Kind = | typeof DIALOG
                   | typeof SOURCE
                   | typeof UPDATE;

export const LATEST = 'Latest' as const,
             ACTIVE = 'Active' as const,
             CACHED = 'Cached' as const,
             SINGLE = 'Single' as const;

export type Doken<K extends Kind = Kind> =
  | Latest<K>
  | Active<K>
  | Cached<K>
  | Single<K>;

interface Base {
  id    : Redacted.Redacted<Snowflake.Snowflake>;
  appId : Redacted.Redacted<Snowflake.Snowflake>;
  start : DateTime.Utc;
  until : DateTime.Utc;
  public: boolean;
}

export interface Latest<K extends Kind = Kind> extends Base {
  _tag : typeof LATEST;
  kind : Option.Option<K>;
  value: Option.Option<Redacted.Redacted>;
};

export interface Active<K extends Kind = Kind> extends Base {
  _tag : typeof ACTIVE;
  kind : Option.Option<K>;
  value: Option.Option<Redacted.Redacted<Snowflake.Snowflake>>;
};

export interface Cached<K extends Kind = Kind> extends Base {
  _tag : typeof CACHED;
  kind : Option.Option<K>;
  value: Option.Option<Redacted.Redacted<Snowflake.Snowflake>>;
};

export interface Single<K extends Kind = Kind> extends Base {
  _tag : typeof SINGLE;
  kind : Option.Option<K>;
  value: Option.Option<Redacted.Redacted<Snowflake.Snowflake>>;
};

export const latest = (ix: Discord.APIModalSubmitInteraction | Discord.APIMessageComponentInteraction): Latest => {
  const start = Snowflake.toDateTime(ix.id);

  return {
    _tag  : LATEST,
    id    : Redacted.make(ix.id),
    appId : Redacted.make(ix.application_id),
    start : start,
    until : start.pipe(DateTime.addDuration('2 seconds')),
    kind  : Option.none(),
    value : Option.some(Redacted.make(ix.token)),
    public: !!ix.message?.flags || ix.message?.flags !== 64,
  };
};

export interface Input<K extends Kind = Kind> {
  kind  : K;
  id    : string;
  appId : string;
  value : string;
  public: boolean;
}

export const active = <K extends Kind = Kind>(input: Input<K>) => {
  const start = Snowflake.toDateTime(input.id);

  return {
    _tag : ACTIVE,
    id   : Redacted.make(input.id),
    appId: Redacted.make(input.appId),
    start: start,
    until: start.pipe(DateTime.addDuration('12 minutes')),
    kind : Option.none(),
    value: Option.some(Redacted.make(input.value)),
  };
};

export const toActive = <K extends Kind = Kind>(self: Latest, kind: K): Active<K> =>
  ({
    ...self,
    _tag : ACTIVE,
    kind : Option.some(kind),
    until: self.start.pipe(DateTime.addDuration('12 minutes')),
  });

export const cached = <K extends Kind = Kind>(input: Input<K>): Cached<K> => {
  const start = Snowflake.toDateTime(input.id);

  return {
    _tag  : CACHED,
    id    : Redacted.make(input.id),
    appId : Redacted.make(input.appId),
    start : start,
    until : start.pipe(DateTime.addDuration('12 minutes')),
    kind  : Option.none(),
    value : Option.some(Redacted.make(input.value)),
    public: input.public,
  };
};

export const toCached = <K extends Kind = Kind>(self: Active<K>): Cached<K> =>
  ({
    ...self,
    _tag : CACHED,
    value: Option.none(),
  });

export const single = <K extends Kind = Kind>(input: Input<K>): Single<K> => {
  const start = Snowflake.toDateTime(input.id);

  return {
    _tag  : SINGLE,
    id    : Redacted.make(input.id),
    appId : Redacted.make(input.appId),
    start : start,
    until : start.pipe(DateTime.addDuration('2 seconds')),
    kind  : Option.some(input.kind),
    value : Option.some(Redacted.make(input.value)),
    public: input.public,
  };
};

export const toSingle = <K extends Kind = Kind>(self: Latest, kind: K): Single<K> =>
  ({
    ...self,
    _tag: SINGLE,
    kind: Option.some(kind),
  });

export const ttlOption = (self: Doken, now: DateTime.Utc) =>
  now.pipe(
    DateTime.distanceDurationEither(self.until),
    Option.getRight,
    Option.map((ttl) => [self, ttl] as const),
  );

export const durations = (latest: Latest, active: Active, now: DateTime.Utc) =>
  [
    ttlOption(latest, now),
    ttlOption(active, now),
  ] as const;

export interface Exposed<D extends Doken = Doken> {
  _tag  : D['_tag'];
  kind  : Option.Option.Value<D['kind']>;
  id    : string;
  appId : string;
  start : DateTime.DateTime;
  until : DateTime.DateTime;
  value : string;
  public: boolean;
}

export const expose = <D extends Doken>(self: D): Exposed<D> =>
  pipe(
    Option.all({
      kind : self.kind,
      value: self.value,
    }),
    Option.map((all) =>
      ({
        _tag  : self._tag,
        id    : Redacted.value(self.id),
        appId : Redacted.value(self.appId),
        start : self.start,
        until : self.until,
        kind  : all.kind as Option.Option.Value<D['kind']>,
        value : Redacted.value(all.value),
        public: self.public,
      }),
    ),
    Option.getOrThrow,
  );

export const Latest = Schema.declare(
  (u): u is Latest =>
    typeof u === 'object' &&
    !!u &&
    '_tag' in u &&
    u._tag === LATEST,
);

export const Active = Schema.declare(
  (u): u is Active =>
    typeof u === 'object' &&
    !!u &&
    '_tag' in u &&
    u._tag === ACTIVE,
);

export const Cached = Schema.declare(
  (u): u is Cached =>
    typeof u === 'object' &&
    !!u &&
    '_tag' in u &&
    u._tag === CACHED,
);

export const Single = Schema.declare(
  (u): u is Single =>
    typeof u === 'object' &&
    !!u &&
    '_tag' in u &&
    u._tag === SINGLE,
);

export type Serial =
  | Active
  | Cached
  | Single;

export interface Dokens {
  latest: Latest;
  active: Option.Option<Active>;
}

export const dokens = (latest: Latest) =>
  ({
    latest: latest,
    active: Option.none(),
  });
