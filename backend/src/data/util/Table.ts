import {failReservedDEV} from '#src/data/util/document-reserved.ts';
import {decode, encode} from '@msgpack/msgpack';
import {makeUuid7, Uuid7State} from '@typed/id';
import * as DateTime from 'effect/DateTime';
import type * as Duration from 'effect/Duration';
import * as E from 'effect/Effect';
import * as S from 'effect/Schema';
import {deflate, inflate} from 'pako';

export const PrependedId = (start: string) =>
  S.transform(
    S.String.pipe(S.startsWith(start)),
    S.String,
    {
      decode: (s) => s.slice(start.length),
      encode: (s) => `${start}${s}`,
    },
  );

export const AppendedId = (end: string) =>
  S.transform(
    S.String.pipe(S.endsWith(end)),
    S.String,
    {
      decode: (s) => s.slice(0, -end.length),
      encode: (s) => `${s}${end}`,
    },
  );

export const Key = <F extends S.Struct.Fields>(fields: F) => {
  failReservedDEV(fields);
  return S.Struct(fields);
};

export const CompKey = <S1 extends S.Struct.Field, S2 extends S.Struct.Field>(pk: S1, sk: S2) =>
  S.Struct({
    pk,
    sk,
  });

export const GSIKey = <S1 extends S.Struct.Field, S2 extends S.Struct.Field>(gsi: number, pk: S1, sk: S2) =>
  S.Struct({
    [`pk${gsi}`]: pk,
    [`sk${gsi}`]: sk,
  });

export const Created = S.transformOrFail(
  S.DateTimeUtc,
  S.UndefinedOr(S.DateTimeUtcFromSelf),
  {
    decode: (dt) => E.succeed(dt),
    encode: (dt) => dt ? E.succeed(dt) : DateTime.now,
  },
);

export const Updated = S.transformOrFail(
  S.DateTimeUtc,
  S.UndefinedOr(S.DateTimeUtcFromSelf),
  {
    decode: (dt) => E.succeed(dt),
    encode: () => DateTime.now,
  },
);

export const Upgraded = S.transform(
  S.UndefinedOr(S.Boolean),
  S.UndefinedOr(S.Boolean),
  {
    decode: (enc) => enc,
    encode: () => undefined,
  },
).pipe(S.optional);

export const Migrate = S.transform(
  S.UndefinedOr(S.Boolean),
  S.UndefinedOr(S.Boolean),
  {
    decode: (enc) => enc,
    encode: () => undefined,
  },
).pipe(S.optional);

export const Migrated = S.transform(
  S.UndefinedOr(S.Boolean),
  S.UndefinedOr(S.Boolean),
  {
    decode: (enc) => enc,
    encode: () => undefined,
  },
).pipe(S.optional);

const generateUUIDv7 = makeUuid7.pipe(
  E.provide(Uuid7State.Default),
);

export const UUIDv7 = S.transformOrFail(
  S.UUID,
  S.String,
  {
    decode: (id) => E.succeed(id),
    encode: (id) => id === '' ? generateUUIDv7 : E.succeed(id),
  },
).pipe(S.optionalWith({default: () => ''}));

export const Struct = <F extends S.Struct.Fields>(fields: F) => {
  failReservedDEV(fields);
  return S.Struct(fields);
};

export const Item = <T extends string, F extends S.Struct.Fields>(tag: T, version: number, fields: F) => {
  const item = {
    ...fields,
    _tag    : S.tag(tag),
    _v      : S.tag(version),
    _v7     : UUIDv7,
    _c      : S.optionalWith(Created, {default: () => undefined}),
    _u      : S.optionalWith(Updated, {default: () => undefined}),
    _m      : Migrated,
    upgraded: Upgraded,
    migrated: Migrate,
  };
  failReservedDEV(item);
  return S.Struct(item);
};

export const TemporalItem = <T extends string, F extends S.Struct.Fields>(tag: T, version: number, fields: F) => {
  const item = {
    ...fields,
    sk      : UUIDv7,
    _tag    : S.tag(tag),
    _v      : S.tag(version),
    _v7     : UUIDv7,
    created : S.optionalWith(Created, {default: () => undefined}),
    updated : S.optionalWith(Updated, {default: () => undefined}),
    upgraded: Upgraded,
  };
  failReservedDEV(item);
  return S.Struct(item);
};

export const TimeToLive = (duration: Duration.Duration) =>
  S.transformOrFail(
    S.DateTimeUtcFromNumber,
    S.UndefinedOr(S.DateTimeUtcFromSelf),
    {
      decode: (dt) => E.succeed(dt),
      encode: (dt) => dt
        ? E.succeed(dt)
        : DateTime.now.pipe(E.map(DateTime.addDuration(duration))),
    },
  );

export const SelectMenuOption = <A, I, R>(value: S.Schema<A, I, R>) =>
  S.Struct({
    value      : value,
    label      : S.String,
    description: S.optional(S.String),
    default    : S.optional(S.Boolean),
    emoji      : S.optional(S.Struct({
      name: S.String,
    })),
  });

export const CompressedBinary = <A, I, R>(schema: S.Schema<A, I, R>) =>
  S.transform(
    S.String,
    schema,
    {
      decode: (enc) => {
        const buff = Buffer.from(enc, 'base64');
        const pako = inflate(buff);
        return decode(pako) as any;
      },
      encode: (dec) => {
        const pack = encode(dec);
        const pako = deflate(pack);
        return Buffer.from(pako).toString('base64');
      },
    },
  );
