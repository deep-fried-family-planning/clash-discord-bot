import {Document, Id} from '#src/data/arch/index.ts';
import {DataTag} from '#src/data/constants/index.ts';
import {decodeOnly} from '#src/util/util-schema.ts';
import {DateTime} from 'effect';
import * as S from 'effect/Schema';

export const Key = Document.Item({
  pk: Id.EmbedId,
  sk: Id.NowSk,
});

const ApiEmbed = S.Struct({
  type    : S.optional(S.Enums({RICH: 'rich', IMAGE: 'image', VIDEO: 'video', GIFV: 'gifv', ARTICLE: 'article', LINK: 'link', POLL_RESULT: 'poll_result'} as const)),
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

export const Latest = Document.Item({
  ...Key.fields,
  _tag        : S.tag(DataTag.DISCORD_EMBED),
  version     : S.tag(0),
  gsi_embed_id: Id.EmbedId,
  data        : ApiEmbed,
  created     : Document.Created,
  updated     : Document.Updated,
  upgraded    : Document.Upgraded,
});

const Legacy = S.Struct({
  type              : S.Literal('DiscordEmbed'),
  pk                : Id.EmbedId,
  sk                : Id.NowSk,
  gsi_embed_id      : Id.EmbedId,
  version           : S.Literal('1.0.0'),
  created           : S.Date,
  updated           : S.Date,
  original_type     : S.String,
  original_pk       : S.String,
  original_sk       : S.String,
  original_server_id: Id.ServerId,
  original_user_id  : Id.UserId,
  embed             : ApiEmbed,
});

export const Versions = S.Union(
  Latest,
  decodeOnly(Legacy, S.typeSchema(Latest), (enc) => {
    return {
      _tag        : DataTag.DISCORD_EMBED,
      version     : 0,
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

export const is = S.is(Latest);
export const make = Latest.make;
export const equal = S.equivalence(Latest);
export type Type = typeof Latest.Type;
export const put = Document.Put(Latest);
export const get = Document.GetUpgrade(Key, Versions);
export const del = Document.Delete(Key);
