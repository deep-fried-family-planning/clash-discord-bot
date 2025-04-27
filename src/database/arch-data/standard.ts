import type {DataTag} from '#src/database/arch-data/constants/index.ts';
import {Created, Updated, Upgraded} from '#src/database/arch-data/util.ts';
import {forbiddenTransform, S} from '#src/internal/pure/effect.ts';

type PartitionKey = S.Schema<any, string, never> | S.Schema<any, 'now', never>;
type SortKey = S.Schema<any, string, never> | S.Schema<any, 'now', never>;

export const asKey = <
  T extends DataTag,
  P extends PartitionKey,
  S extends SortKey,
  V extends number,
>(tag: T, partitionKey: P, sortKey: S, latestVersion: V, KiB = 1) =>
  ({
    _tag  : tag,
    Pk    : partitionKey,
    Sk    : sortKey,
    latest: latestVersion,
    KiB   : KiB,
    RCU   : Math.ceil(KiB / 4),
    WCU   : Math.ceil(KiB),
  } as const);

export const asLatest = <
  T extends DataTag,
  P extends PartitionKey,
  S extends SortKey,
  V extends number,
  F extends S.Struct.Fields,
>(key: ReturnType<typeof asKey<T, P, S, V>>, fields: F) =>
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
  T extends DataTag,
  P extends PartitionKey,
  S extends SortKey,
  LV extends number,
  V extends number,
  F extends S.Struct.Fields,
>(key: ReturnType<typeof asKey<T, P, S, LV>>, version: V, fields: F) =>
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

export const toLatest = <Aa, Ia, Ra, Ab, Ib, Rb>(
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
  T extends DataTag,
  P extends PartitionKey,
  S extends SortKey,
  V extends number,
  LA, LI, LR,
  VA, VI, VR,
>(
  config: {
    Key     : ReturnType<typeof asKey<T, P, S, V>>;
    Latest  : S.Schema<LA, LI, LR>;
    Versions: S.Schema<VA, VI, VR>;
  },
) => {
  if (!('make' in config.Latest)) {
    throw new Error();
  }

  const encodePk = S.encodeSync(config.Key.Pk as any) as (pk: string | URL) => string;
  const encodeSk = S.encodeSync(config.Key.Sk as any) as (sk: string) => string;
  const encodeKey = (p: string, s: string) =>
    ({
      pk: encodePk(p),
      sk: encodeSk(s),
    });

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
