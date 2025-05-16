import {DataTag} from '#src/database/arch/const/index.ts';
import {Id} from '#src/database/arch/id.ts';
import {declareKey, declareLatest, transformLatest} from '#src/database/arch/arch.ts';
import {EmbedId, NowId, ServerId, UserId} from '#src/internal/discord-old/common.ts';
import {S} from '#src/internal/pure/effect.ts';
import {DateTime} from 'effect';

const DiscordApiEmbed = S.Struct({
  type: S.optional(S.Enums({
    RICH       : 'rich',
    IMAGE      : 'image',
    VIDEO      : 'video',
    GIFV       : 'gifv',
    ARTICLE    : 'article',
    LINK       : 'link',
    POLL_RESULT: 'poll_result',
  } as const)),
  provider: S.optional(S.Struct({
    name: S.optional(S.String),
    url : S.optional(S.String),
  })),
  image: S.optional(S.Struct({
    url      : S.optional(S.String),
    proxy_url: S.optional(S.String),
    height   : S.optional(S.Number),
    width    : S.optional(S.Number),
  })),
  thumbnail: S.optional(S.Struct({
    url      : S.optional(S.String),
    proxy_url: S.optional(S.String),
    height   : S.optional(S.Number),
    width    : S.optional(S.Number),
  })),
  video: S.optional(S.Struct({
    url      : S.optional(S.String),
    proxy_url: S.optional(S.String),
    height   : S.optional(S.Number),
    width    : S.optional(S.Number),
  })),
  author: S.optional(S.Struct({
    name          : S.String,
    url           : S.optional(S.String),
    icon_url      : S.optional(S.String),
    proxy_icon_url: S.optional(S.String),
  })),
  color      : S.optional(S.Number),
  title      : S.optional(S.String),
  url        : S.optional(S.String),
  description: S.optional(S.String),
  footer     : S.optional(S.Struct({
    text          : S.optional(S.String),
    icon_url      : S.optional(S.String),
    proxy_icon_url: S.optional(S.String),
  })),
  fields: S.optional(S.Array(S.Struct({
    name  : S.String,
    value : S.String,
    inline: S.optional(S.Boolean),
  }))),
  timestamp: S.optional(S.String),
});

export const DiscordEmbed = S.Struct({
  type: S.Literal('DiscordEmbed'),

  pk: EmbedId,
  sk: NowId,

  gsi_embed_id: EmbedId,

  version: S.Literal('1.0.0'),
  created: S.Date,
  updated: S.Date,

  original_type     : S.String,
  original_pk       : S.String,
  original_sk       : S.String,
  original_server_id: ServerId,
  original_user_id  : UserId,

  embed: DiscordApiEmbed,
});

export const Key = declareKey(
  DataTag.DISCORD_EMBED,
  Id.EmbedId,
  Id.NowSk,
  0,
);

export const Latest = declareLatest(Key, {
  gsi_embed_id: Id.EmbedId,
  data        : DiscordEmbed.fields.embed,
});

export const Versions = S.Union(
  Latest,
  transformLatest(Latest, DiscordEmbed, (enc) => {
    return {
      _tag        : Key._tag,
      version     : Key.latest,
      upgraded    : true,
      pk          : enc.pk,
      sk          : enc.sk,
      gsi_embed_id: enc.gsi_embed_id,
      created     : DateTime.unsafeMake(enc.created),
      updated     : DateTime.unsafeMake(enc.updated),
      data        : enc.embed,
    } as const;
  }),
);
