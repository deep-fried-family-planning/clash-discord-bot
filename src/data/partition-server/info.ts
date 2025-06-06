import * as DDB from '#src/data/util/DDB.ts';
import * as Id from '#src/data/util/Id.ts';
import * as Table from '#src/data/util/Table.ts';
import * as S from 'effect/Schema';

export const TAG = 'Info';
export const VER = 0;

export const Key = Table.Key({
  pk: Id.ServerId,
  sk: Id.InfoId,
});

export const Latest = Table.Item(TAG, VER, {
  ...Key.fields,
  embed_id: Id.EmbedId,
  select  : Table.SelectMenuOption(Id.EmbedId),
  kind    : S.Enums({omni: 'omni', about: 'about', guide: 'guide', rule: 'rule'} as const),
});

export const Versions = S.Union(
  Latest,
);

export const is = S.is(Latest);
export const make = Latest.make;
export const equal = S.equivalence(Latest);
export const create = DDB.Put(Latest);
export const read = DDB.GetUpgradeV1(Key, Versions);
export const remove = DDB.Delete(Key);
