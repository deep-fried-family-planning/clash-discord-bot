import * as DiscordIO from '#disreact/codec/DiscordIO.ts';
import {declareProto, declareSubtype, fromProto} from '#disreact/util/proto.ts';
import type {Discord} from 'dfx';
import * as DateTime from 'effect/DateTime';
import * as Duration from 'effect/Duration';
import * as Inspectable from 'effect/Inspectable';
import * as Option from 'effect/Option';
import * as Redacted from 'effect/Redacted';
import * as S from 'effect/Schema';
import type * as SynchronizedRef from 'effect/SynchronizedRef';

type Type =
  | 'Source'
  | 'Update'
  | 'Dialog'
  | 'Dismount';

export type Doken<T extends Type = Type> =
  | Fresh<T>
  | Spent<T>
  | Defer<T>
  | Cache<T>;

export type Usable<T extends Type = Type> =
  | Fresh<T>
  | Spent<T>
  | Cache<T>;

export type Serial<T extends Type = Type> =
  | Spent<T>
  | Defer<T>
  | Cache<T>;

export interface Fresh<T extends Type | undefined = Type> extends Inspectable.Inspectable {
  _tag : 'Fresh';
  type : T;
  id   : string;
  app  : string;
  value: Redacted.Redacted;
  until: DateTime.Utc;
  flags: number;
}

export interface Spent<T extends Type = Type> extends Inspectable.Inspectable {
  _tag : 'Spent';
  type : T;
  id   : string;
  app  : string;
  until: DateTime.Utc;
  value: Redacted.Redacted;
  flags: number;
}

export interface Defer<T extends Type = Type> extends Inspectable.Inspectable {
  _tag : 'Defer';
  type : T;
  id   : string;
  app  : string;
  until: DateTime.Utc;
  value: Redacted.Redacted;
  flags: number;
}

export interface Cache<T extends Type = Type> extends Inspectable.Inspectable {
  _tag : 'Cache';
  type : T;
  id   : string;
  app  : string;
  until: DateTime.Utc;
  flags: number;
}

export const isDoken = <T extends Type = Type>(u: unknown): u is Doken<T> => !!u && typeof u === 'object' && '_tag' in u;

export const isFresh = <T extends Type = Type>(u: unknown): u is Fresh<T> => isDoken(u) && u._tag === 'Fresh';

export const isSpent = <T extends Type = Type>(u: unknown): u is Spent<T> => isDoken(u) && u._tag === 'Spent';

export const isDefer = <T extends Type = Type>(u: unknown): u is Defer<T> => isDoken(u) && u._tag === 'Defer';

export const isCache = <T extends Type = Type>(u: unknown): u is Cache<T> => isDoken(u) && u._tag === 'Cache';

const DokenPrototype = declareProto<Doken>({
  _tag : undefined as any,
  type : undefined as any,
  id   : undefined as any,
  app  : undefined as any,
  value: undefined as any,
  until: undefined as any,
  flags: undefined as any,
  ...Inspectable.BaseProto,
  toJSON() {
    return {
      _id : 'Doken',
      _tag: this._tag,
      type: (this as any).type,
    };
  },
});

const FreshPrototype = declareSubtype<Fresh, Doken>(DokenPrototype, {
  _tag: 'Fresh',
});

const SpentPrototype = declareSubtype<Spent, Doken>(DokenPrototype, {
  _tag: 'Spent',
});

const DeferPrototype = declareSubtype<Defer, Doken>(DokenPrototype, {
  _tag: 'Defer',
});

const CachePrototype = declareSubtype<Cache, Doken>(DokenPrototype, {
  _tag: 'Cache',
});

export const fresh = (ix: Discord.APIInteraction): Fresh => {
  const self = fromProto(FreshPrototype);
  self.id = ix.id;
  self.app = ix.application_id;
  self.value = Redacted.make(ix.token);
  self.until = DateTime.addDuration(DiscordIO.parseUtc(ix.id), Duration.millis(2500));
  self.flags = ix.message?.flags ?? 0;
  return self;
};

export interface Input<T extends Type = Type> {
  type : T;
  id   : string;
  app  : string;
  value: string | Redacted.Redacted;
  flags: number;
}

export const spent = <T extends Type = Type>(input: Input<T>): Spent<T> => {
  const self = fromProto(SpentPrototype) as Spent<T>;
  self.id = input.id;
  self.app = input.app;
  self.value = Redacted.isRedacted(input.value) ? input.value : Redacted.make(input.value);
  self.until = DateTime.addDuration(DiscordIO.parseUtc(input.id), Duration.millis(2500));
  self.flags = input.flags;
  return self;
};

export const defer = <T extends Type = Type>(input: Input<T>): Defer<T> => {
  const self = fromProto(DeferPrototype) as Defer<T>;
  self.id = input.id;
  self.app = input.app;
  self.value = Redacted.isRedacted(input.value) ? input.value : Redacted.make(input.value);
  self.until = DateTime.addDuration(DiscordIO.parseUtc(input.id), Duration.minutes(14));
  self.flags = input.flags;
  return self;
};

export const cache = <T extends Type = Type>(input: Input<T>): Cache<T> => {
  const self = fromProto(CachePrototype) as Cache<T>;
  self.id = input.id;
  self.app = input.app;
  self.until = DateTime.addDuration(DiscordIO.parseUtc(input.id), Duration.minutes(14));
  self.flags = input.flags;
  return self;
};

export const toSpent = <T extends Type = Type>(fresh: Fresh, type: T): Spent<T> => {
  return spent({
    ...fresh,
    type: type,
  });
};

export const toDefer = <T extends Type = Type>(fresh: Fresh, type: T): Defer<T> => {
  return defer({
    ...fresh,
    type: type,
  });
};

export const toCache = <T extends Type = Type>(defer: Defer<T>): Cache<T> => {
  return cache(defer);
};

export const validate = <D extends Doken>(doken: D, now: DateTime.Utc): Option.Option<[D, Duration.Duration]> =>
  now.pipe(
    DateTime.distanceDurationEither(doken.until),
    Option.getRight,
    Option.map((ttl) => [doken, ttl]),
  );

export interface Value<T extends Type = Type> {
  id   : string;
  type : T;
  app  : string;
  value: string;
  until: DateTime.Utc;
  flags: number;
}

export const toValue = <T extends Type = Type>(doken: Fresh<T> | Spent<T> | Defer<T>): Value<T> =>
  ({
    id   : doken.id,
    type : doken.type,
    app  : doken.app,
    value: Redacted.value(doken.value),
    until: doken.until,
    flags: doken.flags,
  });

export const Spent = S.declare(isSpent);

export const Defer = S.declare(isDefer);

export const Cache = S.declare(isCache);

export type Choices = SynchronizedRef.SynchronizedRef<{
  fresh: Fresh;
  defer: Option.Option<Defer>;
}>;
