import {ApiEmbed} from '#src/data/items/util.ts';
import * as DDB from '#src/data/util/DDB.ts';
import * as Id from '#src/data/util/Id.ts';
import * as Table from '#src/data/util/Table.ts';
import * as S from 'effect/Schema';

export const TAG = 'InfoEmbed',
             VER = 0;

export const Key = Table.CompKey(Id.EmbedId, Id.PartitionRoot);

export const Latest = Table.Item(TAG, VER, {
  ...Key.fields,
  bin: Table.CompressedBinary(ApiEmbed),
});

export const Versions = S.Union(
  Latest,
);

export const is = S.is(Latest);
export const make = Latest.make;
export const equals = S.equivalence(Latest);
export const create = DDB.Put(Latest);
export const read = DDB.GetUpgradeV1(Key, Versions);
export const update = DDB.Update(Key);
export const remove = DDB.Delete(Key);
