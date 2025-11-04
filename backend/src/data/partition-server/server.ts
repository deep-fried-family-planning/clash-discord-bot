import * as DDB from '#src/data/util/DDB.ts';
import * as Id from '#src/data/util/Id.ts';
import * as Table from '#src/data/util/Table.ts';
import * as S from 'effect/Schema';

export const TAG = 'Server';
export const VER = 0;

export const Key = Table.Key({
  pk: Id.ServerId,
  sk: Id.PartitionRoot,
});

export const Latest = Table.Item(TAG, VER, {
  ...Key.fields,
  pk1  : Id.ServerId,
  sk1  : Id.PartitionRoot,
  forum: S.optional(Id.ChannelId),
  raids: S.optional(Id.ThreadId),
  admin: Id.RoleId,
});

export const Versions = S.Union(
  Latest,
);

export const is = S.is(Latest);
export const make = Latest.make;
export const equals = S.equivalence(Latest);
export const create = DDB.Put(Latest);
export const read = DDB.GetUpgradeV1(Key, Versions);
