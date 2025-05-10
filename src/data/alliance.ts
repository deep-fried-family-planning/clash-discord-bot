import {Document, Id} from '#src/data/arch/index.ts';
import * as S from 'effect/Schema';
import {DataTag} from '#src/data/constants/index.ts';

export const Key = Document.Key({
  pk: Id.AllianceId,
  sk: Id.ServerIdSk,
});

export const Latest = Document.Item({
  _tag   : S.tag(DataTag.ALLIANCE),
  version: S.tag(0),
  ...Key.fields,
});

export const Versions = S.Union(
  Latest,
);

export const key = Key.make;
export const is = S.is(Latest);
export const item = Latest.make;
export const equal = S.equivalence(Latest);
export type Type = typeof Latest.Type;
export type Encoded = typeof Latest.Encoded;
export const putItem = Document.Put(Latest);
export const getItem = Document.GetUpgrade(Key, Versions);
export const deleteItem = Document.Delete(Key);
