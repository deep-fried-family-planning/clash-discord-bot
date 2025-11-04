import * as DDB from '#src/data/util/DDB.ts';
import * as Id from '#src/data/util/Id.ts';
import * as Table from '#src/data/util/Table.ts';
import * as S from 'effect/Schema';

export const TAG = 'Link';
export const VER = 0;

export const Key = Table.Key({
  pk: Id.UserId,
  sk: Id.ServerId,
});

export const Item = Table.Item(TAG, VER, {
  pk  : Id.UserId,
  sk  : Id.ServerId,
  pk2 : Id.ServerId,
  sk2 : Id.UserId,
  tags: S.Record({key: S.String, value: S.String}),
});

export const Versions = S.Union(
  Item,
);

export const is = S.is(Item);
export const make = Item.make;
export const equals = S.equivalence(Item);
export const create = DDB.Put(Item);
export const read = DDB.GetUpgradeV1(Key, Versions);
export const remove = DDB.Delete(Key);
