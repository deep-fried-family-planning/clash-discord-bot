import * as DDB from '#src/data/util/DDB.ts';
import * as Id from '#src/data/util/Id.ts';
import * as Table from '#src/data/util/Table.ts';
import * as S from 'effect/Schema';

export const TAG = 'User';
export const VER = 0;

export const Key = Table.Key({
  pk: Id.UserId,
  sk: Id.PartitionRoot,
});

export const Latest = Table.Item(TAG, VER, {
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

export const is = S.is(Latest);
export const make = Latest.make;
export const equal = S.equivalence(Latest);
export const create = DDB.Put(Latest);
export const read = DDB.GetUpgradeV1(Key, Versions);
