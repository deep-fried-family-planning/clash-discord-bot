import * as Document from '#src/data/util/DDB.ts';
import * as Id from '#src/data/util/Id.ts';
import * as Table from '#src/data/util/Table.ts';
import * as DataTag from '#src/data/constants/data-tag.ts';
import * as S from 'effect/Schema';

export const TAG = DataTag.DISCORD_EMBED;
export const LATEST = 0;

export const Key = Table.Key({
  pk: Id.ServerId,
  sk: Id.InfoId,
});

export const Latest = Table.Item(TAG, LATEST, {
  ...Key.fields,
  embed_id: Id.EmbedId,
  select  : Table.SelectMenuOption(Id.EmbedId),
  kind    : S.Enums({omni: 'omni', about: 'about', guide: 'guide', rule: 'rule'} as const),
});

export const Versions = S.Union(
  Latest,
);

export const encode = S.encode(Latest);
export const decode = S.decode(Versions);
export const is = S.is(Latest);
export const make = Latest.make;
export const equal = S.equivalence(Latest);
export const put = Document.Put(Latest);
export const get = Document.GetUpgradeV1(Key, Versions);
export const del = Document.Delete(Key);
