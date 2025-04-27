import type {DataTag} from '#src/database/data-const/index.ts';
import {E, forbiddenTransform, S} from '#src/internal/pure/effect.ts';
import {decode, encode} from '@msgpack/msgpack';
import type {Duration} from 'effect';
import {DateTime, pipe} from 'effect';
import {deflate, inflate} from 'pako';

export type CompositeKey = {pk: string; sk: string} | Record<string, any>;
export type CacheKey = string;

export const asPrependedId = (start: string) =>
  pipe(
    S.String,
    S.startsWith(start),
    S.transform(
      S.String,
      {
        decode: (s) => s.slice(start.length),
        encode: (s) => start.concat(s),
      },
    ),
    S.transform(
      S.String,
      {
        decode: (s) => {
          if (s.startsWith(start)) {
            throw new Error();
          }
          return s;
        },
        encode: (s) => {
          if (s.startsWith(start)) {
            throw new Error();
          }
          return s;
        },
      },
    ),
  );

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

export const TimeToLive = (duration: Duration.Duration) =>
  S.transformOrFail(
    S.DateTimeUtcFromNumber,
    S.UndefinedOr(S.DateTimeUtcFromSelf),
    {
      decode: (dt) => E.succeed(dt),
      encode: (dt) => dt
        ? E.succeed(dt)
        : pipe(
          DateTime.now,
          E.map(
            DateTime.addDuration(duration),
          ),
        ),
    },
  );

export const Decoded = S.transform(
  S.Undefined,
  S.Literal(true),
  {
    decode: () => true as const,
    encode: () => undefined,
  },
);

export const Upgraded = pipe(
  S.Union(S.Undefined, S.Boolean),
  S.transform(
    S.Union(S.Undefined, S.Boolean),
    {
      decode: (enc) => enc,
      encode: () => undefined,
    },
  ),
  S.optional,
);

export const SelectMetadata = <A, I, R>(value: S.Schema<A, I, R>) =>
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
  S.transform(S.String, schema, {
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
  });

export const asKey = <
  Tag extends DataTag,
  PartitionKey extends S.Schema<any, string, never>,
  SortKey extends S.Schema<any, string, never> | S.Schema<any, 'now', never>,
  LatestVersion extends number,
>(
  tag: Tag,
  pk: PartitionKey,
  sk: SortKey,
  latest: LatestVersion,
  KiB = 1,
) =>
  ({
    _tag  : tag,
    Pk    : pk,
    Sk    : sk,
    latest: latest,
    KiB   : KiB,
    RCU   : Math.ceil(KiB / 4),
    WCU   : Math.ceil(KiB),
  } as const);

export const asLatest = <
  Tag extends DataTag,
  PartitionKey extends S.Schema<any, string, never>,
  SortKey extends S.Schema<any, string, never> | S.Schema<any, 'now', never>,
  LatestVersion extends number,
  Fields extends S.Struct.Fields,
>(
  key: ReturnType<typeof asKey<Tag, PartitionKey, SortKey, LatestVersion>>,
  fields: Fields,
) =>
  S.Struct({
    _tag    : S.tag(key._tag),
    version : S.Literal(key.latest),
    upgraded: Upgraded,
    pk      : key.Pk,
    sk      : key.Sk,
    created : Created,
    updated : Updated,
    ...fields,
  });

export const asVersion = <
  Tag extends DataTag,
  PartitionKey extends S.Schema<any, string, never>,
  SortKey extends S.Schema<any, string, never> | S.Schema<any, 'now', never>,
  LatestVersion extends number,
  Version extends number,
  Fields extends S.Struct.Fields,
>(
  key: ReturnType<typeof asKey<Tag, PartitionKey, SortKey, LatestVersion>>,
  version: Version,
  fields: Fields,
) =>
  S.Struct({
    _tag    : S.tag(key._tag),
    version : S.Literal(key.latest),
    upgraded: Upgraded,
    pk      : key.Pk,
    sk      : key.Sk,
    created : Created,
    updated : Updated,
    ...fields,
  });

export const toLatest = <
  Aa, Ia, Ra,
  Ab, Ib, Rb,
>(
  latest: S.Schema<Ab, Ib, Rb>,
  outdated: S.Schema<Aa, Ia, Ra>,
  decode: (enc: typeof outdated.Type) => typeof latest.Type,
) =>
  S.transform(
    outdated,
    S.typeSchema(latest),
    {
      strict: true,
      decode: decode,
      encode: forbiddenTransform,
    },
  );

type ImpliedKeys = | '_tag'
                   | 'version'
                   | 'upgraded'
                   | 'created'
                   | 'updated';

type ImpliedStruct = {
  [K in ImpliedKeys]?: any
};

export const toStandard = <
  Tag extends DataTag,
  PartitionKey extends S.Schema<any, string, never>,
  SortKey extends S.Schema<any, string, never> | S.Schema<any, 'now', never>,
  LatestVersion extends number,
  LA, LI, LR,
  VA, VI, VR,
>(
  config: {
    Key     : ReturnType<typeof asKey<Tag, PartitionKey, SortKey, LatestVersion>>;
    Latest  : S.Schema<LA, LI, LR>;
    Versions: S.Schema<VA, VI, VR>;
  },
) => {
  if (!('make' in config.Latest)) {
    throw new Error();
  }

  const encodePk = S.encodeSync(config.Key.Pk as any) as (pk: string | URL) => string;
  const encodeSk = S.encodeSync(config.Key.Sk as any) as (sk: string) => string;
  const encodeKey = (p: string, s: string) => ({pk: encodePk(p), sk: encodeSk(s)});

  type Type = typeof config.Versions['Type'];
  type Make = Omit<Type, ImpliedKeys>;

  const make = (p: Make & ImpliedStruct): LA =>
    (config.Latest as any).make({
      _tag   : config.Key._tag,
      version: config.Key.latest,
      created: undefined,
      updated: undefined,
      ...p,
    }) as LA;

  return {
    _     : config.Latest.Type,
    _i    : config.Latest.Encoded,
    _tag  : config.Key._tag,
    latest: config.Key.latest,
    KiB   : config.Key.KiB,
    RCU   : config.Key.RCU,
    WCU   : config.Key.WCU,
    encodePk,
    encodeSk,
    encodeKey,
    decode: S.decodeUnknown(config.Versions),
    encode: S.encodeUnknown(config.Latest),
    equals: S.equivalence(config.Versions),
    Schema: config.Versions,
    make,
  };
};

export const ClanVerification = S.Enums({
  admin    : 0,
  elder    : 1,
  coleader : 2,
  leader   : 3,
  developer: 4,
} as const);

export const PlayerVerification = S.Enums({
  none     : 0,
  admin    : 1,
  token    : 2,
  developer: 3,
} as const);
