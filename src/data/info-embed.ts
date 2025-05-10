import {Document, Id} from '#src/data/arch/index.ts';
import {ApiEmbed} from '#src/data/arch/other.ts';
import {DataTag} from '#src/data/constants/index.ts';
import {decodeOnly} from '#src/util/util-schema.ts';
import * as S from 'effect/Schema';

export const Key = Document.Key({
  pk: Id.EmbedId,
  sk: Id.NowSk,
});

export const Latest = Document.Item({
  _tag        : S.tag(DataTag.DISCORD_EMBED),
  _ver        : S.tag(0),
  ...Key.fields,
  gsi_embed_id: Id.EmbedId,
  embed       : ApiEmbed,
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
    return Document.upgrade({
      _tag        : DataTag.DISCORD_EMBED,
      _ver        : 0,
      pk          : enc.pk,
      sk          : enc.sk,
      gsi_embed_id: enc.gsi_embed_id,
      embed       : enc.embed,
    });
  }),
);

export const makeKey = Key.make;
export const make = Latest.make;
export const is = S.is(Latest);
export const isEqual = S.equivalence(Latest);
export const putItem = Document.Put(Latest);
export const getItem = Document.GetUpgrade(Key, Versions);
export const deleteItem = Document.Delete(Key);
export type Type = typeof Latest.Type;
export type Encoded = typeof Latest.Encoded;
