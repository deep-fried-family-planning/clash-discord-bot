import {PlayerVerification} from '#src/data/util/index.ts';
import * as DDB from '#src/data/util/DDB.ts';
import * as Id from '#src/data/util/Id.ts';
import * as Table from '#src/data/util/Table.ts';
import * as S from 'effect/Schema';

export const TAG = 'Player';
export const VER = 0;

export const Key = Table.Key({
  pk: Id.UserId,
  sk: Id.PlayerTag,
});

export const Latest = Table.Item(TAG, VER, {
  pk          : Id.UserId,
  sk          : Id.PlayerTag,
  pk2         : Id.PlayerTag,
  sk2         : Id.UserId,
  name        : S.String,
  verification: S.Enums(PlayerVerification),
  account_type: S.String,
});

export const Versions = S.Union(
  Latest,
);

export const is = S.is(Latest);
export const make = Latest.make;
export const equals = S.equivalence(Latest);
export const create = DDB.Put(Latest);
export const read = DDB.GetUpgradeV1(Key, Versions);
export const remove = DDB.Delete(Key);
