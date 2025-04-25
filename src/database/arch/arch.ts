import type {DataTag} from '#src/database/arch/index.ts';
import {E, forbiddenTransform, pipe, S} from '#src/internal/pure/effect.ts';
import {DateTime} from 'effect';

export type CompositeKey = {
  pk: string;
  sk: string;
} | Record<string, any>;
export type CacheKey = string;

export const Created = S.transformOrFail(
  S.DateTimeUtc,
  S.NullishOr(S.DateTimeUtcFromSelf),
  {
    decode: (dt) => E.succeed(dt),
    encode: (dt) => dt ? E.succeed(dt) : DateTime.now,
  },
);

export const Updated = S.transformOrFail(
  S.DateTimeUtc,
  S.NullishOr(S.DateTimeUtcFromSelf),
  {
    decode: (dt) => E.succeed(dt),
    encode: () => DateTime.now,
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

export const asKey = <
  Tag extends DataTag,
  PartitionKey extends S.Schema<string, string, never>,
  SortKey extends S.Schema<string, string, never> | S.Literal<any>,
  LatestVersion extends number,
>(
  tag: Tag,
  pk: PartitionKey,
  sk: SortKey,
  latest: LatestVersion,
) =>
  ({
    tag: tag,
    Tag: tag,
    Pk : pk,
    Sk : sk,
    latest,
  } as const);

export const asLatest = <
  Key extends ReturnType<typeof asKey>,
  Fields extends S.Struct.Fields,
>(
  key: Key,
  fields: Fields,
) =>
  S.Struct({
    _tag    : S.tag(key.tag),
    version : S.Literal(key.latest),
    pk      : key.Pk,
    sk      : key.Sk,
    upgraded: Upgraded,
    created : Created,
    updated : Updated,
    ...fields,
  });

export const asVersion = <
  Key extends ReturnType<typeof asKey>,
  Version extends number,
  Fields extends S.Struct.Fields,
>(
  key: Key,
  version: Version,
  fields: Fields,
) =>
  S.Struct({
    _tag    : S.tag(key.tag),
    version : S.Literal(version),
    pk      : key.Pk,
    sk      : key.Sk,
    upgraded: Upgraded,
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

export const toStandard = <
  Key extends ReturnType<typeof asKey>,
  Latest extends ReturnType<typeof toLatest>,
  A extends Latest['Type'],
  I,
  R,
>(
  config: {
    Key     : Key;
    Versions: S.Schema<A, I, R>;
  },
) => {
  const encodePk = S.encodeSync(config.Key.Pk);
  const encodeSk = S.encodeSync(config.Key.Sk);

  return {
    encodePk,
    encodeSk,
    encodeKey: (p: string, s: string) => ({pk: encodePk(p), sk: encodeSk(s)}),
    decode   : S.decodeUnknown(config.Versions),
    encode   : S.encodeUnknown(config.Versions),
    equals   : S.equivalence(config.Versions),
    Schema   : config.Versions,
    Key      : config.Key,
    Type     : config.Versions.Type,
    Encoded  : config.Versions.Encoded,
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
