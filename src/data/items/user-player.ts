import {Document, IdSchema} from '#src/data/arch/index.ts';
import {DataTag} from '#src/data/constants/index.ts';
import {decodeOnly} from '#src/util/util-schema.ts';
import * as DateTime from 'effect/DateTime';
import * as S from 'effect/Schema';

export const PlayerVerification = S.Enums({
  none     : 0,
  admin    : 1,
  token    : 2,
  developer: 3,
} as const);

export const Key = Document.Item({
  pk: IdSchema.UserId,
  sk: IdSchema.PlayerTag,
});

export const Latest = Document.Item({
  ...Key.fields,
  _tag          : S.tag(DataTag.USER_PLAYER),
  version       : S.tag(0),
  name          : S.String,
  gsi_user_id   : IdSchema.UserId,
  gsi_player_tag: IdSchema.PlayerTag,
  embed_id      : S.optional(IdSchema.EmbedId),
  verification  : PlayerVerification,
  account_type  : S.String,
  created       : Document.Created,
  updated       : Document.Updated,
  upgraded      : Document.Upgraded,
});

const Legacy = S.Struct({
  pk            : IdSchema.UserId,
  sk            : IdSchema.PlayerTag,
  type          : S.Literal('DiscordPlayer'),
  version       : S.Literal('1.0.0'),
  created       : S.Date,
  updated       : S.Date,
  gsi_user_id   : IdSchema.UserId,
  gsi_player_tag: IdSchema.PlayerTag,
  embed_id      : S.optional(IdSchema.EmbedId),
  alias         : S.optional(S.String),
  verification  : S.Enums({none: 0, admin: 1, token: 2, developer: 3}),
  account_type  : S.String,
});

export const Versions = S.Union(
  Latest,
  decodeOnly(Legacy, S.typeSchema(Latest), (enc) => {
    return {
      _tag          : DataTag.USER_PLAYER,
      version       : 0,
      upgraded      : true,
      pk            : enc.pk,
      sk            : enc.sk,
      name          : '',
      account_type  : enc.account_type,
      created       : DateTime.unsafeMake(enc.created),
      updated       : DateTime.unsafeMake(enc.updated),
      gsi_user_id   : enc.gsi_user_id,
      gsi_player_tag: enc.gsi_player_tag,
      embed_id      : enc.embed_id,
      verification  : enc.verification as any,
    } as const;
  }),
);

export const put = Document.Put(Latest);
export const get = Document.Get(Key, Versions);
export const del = Document.Delete(Key);

export type Type = typeof Latest.Type;
