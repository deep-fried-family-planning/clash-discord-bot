import * as Document from '#src/data/util/DDB.ts';
import * as Id from '#src/data/util/Id.ts';
import * as Table from '#src/data/util/Table.ts';
import * as DataTag from '#src/data/constants/data-tag.ts';
import * as S from 'effect/Schema';

export const TAG = DataTag.SERVER_CLAN;
export const LATEST = 1;

export const ClanVerification = S.Enums({
  admin    : 0,
  elder    : 1,
  coleader : 2,
  leader   : 3,
  developer: 4,
} as const);

export const Key = Table.Key({
  pk: Id.ServerId,
  sk: Id.ClanTag,
});

export const Latest = Table.Item(TAG, LATEST, {
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
  verification   : S.optionalWith(ClanVerification, {default: () => 0}),
  select         : S.optional(Table.SelectMenuOption(Id.ClanTag)),
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
export const get = Document.GetUpgradeV1(Key, Versions);
export const del = Document.Delete(Key);
