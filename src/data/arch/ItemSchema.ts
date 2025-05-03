import type {DataTag} from '#src/database/arch/const/index.ts';
import type {E} from '#src/internal/pure/effect.ts';
import {forbiddenTransform} from '#src/internal/pure/effect.ts';
import type {ParseResult} from 'effect';
import {DateTime, type Equivalence, pipe} from 'effect';
import * as S from 'effect/Schema';

type PartitionKey = S.Schema<any, string, never> | S.Schema<any, 'now', never>;
type SortKey = | S.Schema<any, string, never>
               | S.Schema<any, 'now', never>
               | S.Schema<any, 'config', never>;

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

export const ItemKey = <
  T extends string,
  PKA, PKI, PKR,
  SKA, SKI, SKR,
>() =>
  ({});

export const Item = <
  Tag extends string,
  PKA, PKI, PKR,
  SKA, SKI, SKR,
  Version extends number,
  Fields extends S.Struct.Fields,
>(
  tag: Tag,
  pk: S.Schema<PKA, PKI, PKR>,
  sk: S.Schema<SKA, SKI, SKR>,
  version: Version,
  fields: Fields,
) =>
  S.TaggedStruct(tag, {
    pk,
    sk,
    version : S.tag(version),
    upgraded: Upgraded,
    created : Created,
    updated : Updated,
    ...fields,
  });

export type KeyDeclaration<
  T extends DataTag,
  P extends PartitionKey,
  S extends SortKey,
> = {
  _tag  : T;
  Pk    : P;
  Sk    : S;
  latest: number;
  KiB   : number;
  RCU   : number;
  WCU   : number;
};

export const declareKey = <
  T extends DataTag,
  P extends PartitionKey,
  S extends SortKey,
>(tag: T, partitionKey: P, sortKey: S, latestVersion: number, KiB = 1): KeyDeclaration<T, P, S> =>
  ({
    _tag  : tag,
    Pk    : partitionKey,
    Sk    : sortKey,
    latest: latestVersion,
    KiB   : KiB,
    RCU   : Math.ceil(KiB / 4),
    WCU   : Math.ceil(KiB),
  });

export const declareLatest = <
  T extends DataTag,
  P extends PartitionKey,
  S extends SortKey,
  F extends S.Struct.Fields,
>(key: KeyDeclaration<T, P, S>, fields: F) =>
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
  F extends S.Struct.Fields,
>(key: KeyDeclaration<T, P, S>, version: number, fields: F) =>
  S.Struct({
    _tag    : S.tag(key._tag),
    version : S.Literal(version),
    upgraded: Upgraded,
    pk      : key.Pk,
    sk      : key.Sk,
    created : Created,
    updated : Updated,
    ...fields,
  });

export const transformLatest = <Aa, Ia, Ra, Ab, Ib, Rb>(
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

export type DeclareCodec<
  T extends DataTag,
  LA, LI, LR,
  VA, VI, VR,
> = {
  _        : LA;
  _i       : LI;
  _tag     : T;
  latest   : number;
  KiB      : number;
  RCU      : number;
  WCU      : number;
  encodePk : (pk: string | URL) => string;
  encodeSk : (sk: string) => string;
  encodeKey: (p: string, s: string) => {pk: string; sk: string};
  decode   : (u: unknown) => E.Effect<LA, ParseResult.ParseError, LR | VR>;
  encode   : (u: unknown) => E.Effect<LI, ParseResult.ParseError, LR>;
  equals   : Equivalence.Equivalence<LA>;
  Schema   : S.Schema<LA, VI, VR>;
  make     : (u: Omit<LA, ImpliedKeys>) => LA;
};

export const declareCodec = <
  T extends DataTag,
  P extends PartitionKey,
  S extends SortKey,
  LA, LI, LR,
  VA, VI, VR,
>(
  config: {
    Key     : KeyDeclaration<T, P, S>;
    Latest  : S.Schema<LA, LI, LR>;
    Versions: S.Schema<LA, VI, VR>;
  },
): DeclareCodec<T, LA, LI, LR, VA, VI, VR> => {
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
