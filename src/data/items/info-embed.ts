import {Document, Id} from '#src/data/arch/index.ts';
import * as Table from '#src/data/arch/Table.ts';
import {DataTag} from '#src/data/constants/index.ts';
import {decodeOnly} from '#src/util/util-schema.ts';
import {DateTime} from 'effect';
import * as S from 'effect/Schema';
import { ApiEmbed } from './util';

export const TAG = DataTag.DISCORD_EMBED;
export const LATEST = 0;

export const Latest = Table.Item(TAG, LATEST, {
  pk   : S.String,
  sk   : S.tag('.'),
  embed: ApiEmbed,
});

export const Key = Latest.pick('pk', 'sk');

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
      _tag    : TAG,
      _v      : LATEST,
      _v7     : '',
      upgraded: true,
      pk      : enc.pk,
      sk      : enc.sk,
      created : DateTime.unsafeMake(enc.created),
      updated : DateTime.unsafeMake(enc.updated),
      embed   : enc.embed,
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
