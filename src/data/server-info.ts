import {Document, Id} from '#src/data/arch/index.ts';
import {DataTag} from '#src/data/constants/index.ts';
import {decodeOnly} from '#src/util/util-schema.ts';
import * as S from 'effect/Schema';
import * as Table from './arch/Table.ts';

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

const Legacy = S.Struct({
  type          : S.Literal('DiscordInfo'),
  pk            : Id.ServerId,
  sk            : Id.InfoId,
  version       : S.Literal('1.0.0'),
  created       : S.String,
  updated       : S.String,
  embed_id      : S.optional(Id.EmbedId),
  selector_label: S.optional(S.String),
  selector_desc : S.optional(S.String),
  selector_order: S.optional(S.Number),
  kind          : S.Enums({omni: 'omni', about: 'about', guide: 'guide', rule: 'rule'} as const),
  after         : S.optional(S.String),
  name          : S.optional(S.String),
  desc          : S.optional(S.String),
  color         : S.optional(S.Number),
  image         : S.optional(S.String),
});

export const Versions = S.Union(
  Latest,
  decodeOnly(Legacy, Latest, (fromA) => {
    return {
      _tag    : TAG,
      _v      : LATEST,
      _v7     : '',
      upgraded: true,
      pk      : fromA.pk,
      sk      : fromA.sk,
      created : fromA.created,
      updated : fromA.updated,
      embed_id: fromA.embed_id ?? '',
      kind    : fromA.kind,
      select  : {
        value      : fromA.embed_id ?? '',
        label      : fromA.selector_label ?? fromA.embed_id ?? '',
        description: fromA.selector_desc ?? fromA.desc ?? '',
      },
    } as const;
  }),
);
export const is = S.is(Latest);
export const make = Latest.make;
export const equal = S.equivalence(Latest);
export type Type = typeof Latest.Type;
export const put = Document.Put(Latest);
export const get = Document.GetUpgrade(Key, Versions);
export const del = Document.Delete(Key);
