import * as Table from './arch/Table.ts';
import * as Id from './arch/Id.ts';
import * as DataTag from './constants/data-tag.ts';
import * as S from 'effect/Schema';
import * as Document from './arch/Document.ts';

export const TAG = DataTag.USER_SERVER_LINK;
export const LATEST = 0;

export const Key = Table.Key({
  pk: Id.UserId,
  sk: Id.ServerId,
});

export const GsiLinkKey = Table.Key({
  pkl: Id.ServerId,
  skl: Id.UserId,
});

export const Item = Table.Item(TAG, LATEST, {
  ...Key.fields,
  ...GsiLinkKey.fields,
  tags: S.Record({
    key  : S.String,
    value: S.String,
  }),
});

export const Versions = S.Union(
  Item,
);

export const is = S.is(Item);
export const make = Item.make;
export const equal = S.equivalence(Item);
export type Type = typeof Item.Type;
export type Encoded = typeof Item.Encoded;
export const put = Document.Put(Item);
export const get = Document.GetUpgrade(Key, Versions);
export const del = Document.Delete(Key);
