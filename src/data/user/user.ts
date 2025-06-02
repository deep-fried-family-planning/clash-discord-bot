import * as DDB from '#src/data/DDB.ts';
import * as Id from '#src/data/Id.ts';
import * as Table from '#src/data/Table.ts';
import * as DataTag from '#src/data/constants/data-tag.ts';
import * as S from 'effect/Schema';

export const TAG = DataTag.USER;
export const LATEST = 1;

export const Key = Table.Key({
  pk: Id.UserId,
  sk: Id.PartitionRoot,
});

export const Latest = Table.Item(TAG, LATEST, {
  pk      : Id.UserId,
  sk      : Id.PartitionRoot,
  pk1     : Id.UserId,
  sk1     : Id.PartitionRoot,
  timezone: S.TimeZone,
  servers : S.Set(Id.ServerId),
  dev     : S.optional(S.Boolean),
  doc     : S.optional(S.Boolean),
});

export const Versions = S.Union(
  Latest,
);

export const encode = S.encode(Latest);
export const decode = S.decode(Versions);
export const is = S.is(Latest);
export const make = Latest.make;
export const equal = S.equivalence(Latest);
export type Type = typeof Latest.Type;
export type Encoded = typeof Latest.Encoded;
export const put = DDB.Put(Latest);
export const get = DDB.GetUpgradeV1(Key, Versions);
export const del = DDB.Delete(Key);
