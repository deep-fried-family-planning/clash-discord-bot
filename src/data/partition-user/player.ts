import * as DDB from '#src/data/util/DDB.ts';
import * as Id from '#src/data/util/Id.ts';
import * as Table from '#src/data/util/Table.ts';
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
export const equals = S.equivalence(Latest);
export const create = DDB.Put(Latest);
export const read = DDB.GetUpgradeV1(Key, Versions);
export const remove = DDB.Delete(Key);
