import * as Document from '#src/data/arch/Document.ts';
import * as Id from '#src/data/arch/Id.ts';
import * as Table from '#src/data/arch/Table.ts';
import * as DataTag from '#src/data/constants/data-tag.ts';
import * as S from 'effect/Schema';

export const TAG = DataTag.USER_SERVER_LINK;
export const LATEST = 0;

export const Key = Table.Key({
  pk: Id.UserId,
  sk: Id.ServerId,
});

export const GSI2Key = Table.Key({
  pk2: Id.ServerId,
  sk2: Id.UserId,
});

export const Item = Table.Item(TAG, LATEST, {
  pk  : Id.UserId,
  sk  : Id.ServerId,
  pk2 : Id.ServerId,
  sk2 : Id.UserId,
  tags: S.Record({key: S.String, value: S.String}),
});

export const Versions = S.Union(
  Item,
);

export const encode = S.encode(Item);
export const decode = S.decode(Versions);
export const is = S.is(Item);
export const make = Item.make;
export const equal = S.equivalence(Item);
export type Type = typeof Item.Type;
export type Encoded = typeof Item.Encoded;
export const put = Document.Put(Item);
export const get = Document.GetUpgrade(Key, Versions);
export const del = Document.Delete(Key);
