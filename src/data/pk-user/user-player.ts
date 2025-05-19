import * as Document from '#src/data/arch/Document.ts';
import * as Id from '#src/data/arch/Id.ts';
import * as Table from '#src/data/arch/Table.ts';
import * as DataTag from '#src/data/constants/data-tag.ts';
import * as S from 'effect/Schema';

export const TAG = DataTag.USER_PLAYER;
export const LATEST = 1;

export const PlayerVerification = S.Enums({
  none     : 0,
  admin    : 1,
  token    : 2,
  developer: 3,
} as const);

export const Key = Table.Key({
  pk: Id.UserId,
  sk: Id.PlayerTag,
});

export const Latest = Table.Item(TAG, LATEST, {
  pk          : Id.UserId,
  sk          : Id.PlayerTag,
  pk2         : Id.PlayerTag,
  sk2         : Id.UserId,
  name        : S.String,
  verification: PlayerVerification,
  account_type: S.String,
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
export const get = Document.GetUpgrade(Key, Versions);
export const del = Document.Delete(Key);
