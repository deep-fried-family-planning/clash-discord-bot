import * as Document from '#src/data/util/DDB.ts';
import * as Id from '#src/data/util/Id.ts';
import * as Table from '#src/data/util/Table.ts';
import * as DataTag from '#src/data/constants/data-tag.ts';
import * as S from 'effect/Schema';

export const TAG = DataTag.SERVER;
export const LATEST = 1;

export const Key = Table.Key({
  pk: Id.ServerId,
  sk: Id.PartitionRoot,
});

export const Latest = Table.Item(TAG, LATEST, {
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

export const encode = S.encode(Latest);
export const decode = S.decode(Versions);
export const is = S.is(Latest);
export const make = Latest.make;
export const equal = S.equivalence(Latest);
export type Type = typeof Latest.Type;
export type Encoded = typeof Latest.Encoded;
export const put = Document.Put(Latest);
export const get = Document.GetUpgradeV1(Key, Versions);
export const del = Document.Delete(Key);
