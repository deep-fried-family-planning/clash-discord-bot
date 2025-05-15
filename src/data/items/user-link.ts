import * as Table from '#src/data/arch/Table.ts';
import * as Id from '#src/data/arch/Id.ts';
import * as DataTag from '#src/data/constants/data-tag.ts';
import {Latest} from '#src/data/items/user-player.ts';
import * as S from 'effect/Schema';
import * as Document from '#src/data/arch/Document.ts';

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

export const encode = S.encode(Latest);
export const decode = S.decode(Versions);
export const is = S.is(Latest);
export const make = Latest.make;
export const equal = S.equivalence(Latest);
export type Type = typeof Latest.Type;
export type Encoded = typeof Latest.Encoded;
export const put = Document.Put(Latest);
export const get = Document.GetUpgrade(Key, Versions);
export const del = Document.Delete(Key);
