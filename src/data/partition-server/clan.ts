import {ClanVerification} from '#src/data/util/index.ts';
import * as DDB from '#src/data/util/DDB.ts';
import * as Id from '#src/data/util/Id.ts';
import * as Table from '#src/data/util/Table.ts';
import * as S from 'effect/Schema';

export const TAG = 'Clan';
export const VER = 0;

export const Key = Table.Key({
  pk: Id.ServerId,
  sk: Id.ClanTag,
});

export const Latest = Table.Item(TAG, VER, {
  pk             : Id.ServerId,
  sk             : Id.ClanTag,
  pk2            : Id.ClanTagPk,
  sk2            : Id.ServerId,
  alias          : S.optional(S.String),
  name           : S.String,
  description    : S.String,
  polling        : S.optionalWith(S.Boolean, {default: () => true}),
  prep           : S.optional(Id.ThreadId),
  prep_opponent  : S.optional(Id.ClanTag),
  battle         : S.optional(Id.ThreadId),
  battle_opponent: S.optional(Id.ClanTag),
  countdown      : S.optional(Id.ChannelId),
  verification   : S.Enums(ClanVerification),
  select         : S.optional(Table.SelectMenuOption(Id.ClanTag)),
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
