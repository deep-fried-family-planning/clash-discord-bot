import {Document, Id} from '#src/data/arch/index.ts';
import {DataTag} from '#src/data/constants/index.ts';
import * as S from 'effect/Schema';

export const Key = Document.Key({
  pk: Id.UserId,
  sk: Id.ServerId,
});

export const Latest = Document.Item({
  _tag   : S.tag(DataTag.USER_SERVER_LINK),
  pk     : Id.UserId,
  sk     : Id.ServerId,
  pk_link: Id.ServerId,
  sk_link: Id.UserId,
  players: S.Record({key: Id.PlayerTag, value: S.String}),
});

export const Versions = S.Union(
  Latest,
);

export const makeKey = Key.make;
export const make = Latest.make;
export const is = S.is(Latest);
export const isEqual = S.equivalence(Latest);
export const putItem = Document.Put(Latest);
export const getItem = Document.GetUpgrade(Key, Versions);
export const deleteItem = Document.Delete(Key);
export type Type = typeof Latest.Type;
export type Encoded = typeof Latest.Encoded;
