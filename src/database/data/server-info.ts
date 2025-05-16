import {DataTag} from '#src/database/arch/const/index.ts';
import {Id} from '#src/database/arch/id.ts';
import {declareKey, declareLatest, transformLatest} from '#src/database/arch/arch.ts';
import {SelectMetadata} from '#src/database/arch/common.ts';
import {EmbedId, InfoId, ServerId} from '#src/internal/discord-old/common.ts';
import {S} from '#src/internal/pure/effect.ts';
import {DateTime} from 'effect';

export const DiscordInfo = S.Struct({
  type: S.Literal('DiscordInfo'),

  pk: ServerId,
  sk: InfoId,

  version: S.Literal('1.0.0'),
  created: S.Date,
  updated: S.Date,

  embed_id      : S.optional(EmbedId),
  selector_label: S.optional(S.String),
  selector_desc : S.optional(S.String),
  selector_order: S.optional(S.Number),

  kind: S.Enums({
    omni : 'omni',
    about: 'about',
    guide: 'guide',
    rule : 'rule',
  } as const),

  after: S.optional(S.String),
  name : S.optional(S.String),
  desc : S.optional(S.String),
  color: S.optional(S.Number),
  image: S.optional(S.String),
});

export const Key = declareKey(
  DataTag.SERVER_INFO,
  Id.ServerId,
  Id.InfoId,
  0,
);

export const Latest = declareLatest(Key, {
  embed_id: Id.EmbedId,
  select  : SelectMetadata(Id.EmbedId),
  kind    : S.Enums({
    omni : 'omni',
    about: 'about',
    guide: 'guide',
    rule : 'rule',
  } as const),
});

export const Versions = S.Union(
  Latest,
  transformLatest(Latest, DiscordInfo, (enc) => {
    return {
      _tag    : Key._tag,
      version : Key.latest,
      upgraded: true,
      pk      : enc.pk,
      sk      : enc.sk,
      created : DateTime.unsafeMake(enc.created),
      updated : DateTime.unsafeMake(enc.updated),
      embed_id: enc.embed_id ?? '',
      kind    : enc.kind,
      select  : {
        value      : enc.embed_id ?? '',
        label      : enc.selector_label ?? enc.embed_id ?? '',
        description: enc.selector_desc ?? enc.desc ?? '',
      },
    } as const;
  }),
);
