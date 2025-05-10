import {ClashOfClans} from '#src/clash/clashofclans.ts';
import {Document, Id} from '#src/data/arch/index.ts';
import {DataTag} from '#src/data/constants/index.ts';
import {decodeOrFail} from '#src/util/util-schema.ts';
import * as E from 'effect/Effect';
import * as S from 'effect/Schema';

export const PlayerVerification = S.Enums({
  none     : 0,
  admin    : 1,
  token    : 2,
  developer: 3,
} as const);

export const Key = Document.Key({
  pk: Id.UserId,
  sk: Id.PlayerTag,
});

export const Latest = Document.Item({
  ...Key.fields,
  _tag          : S.tag(DataTag.USER_PLAYER),
  _ver          : S.tag(0),
  name          : S.String,
  gsi_user_id   : Id.UserId,
  gsi_player_tag: Id.PlayerTag,
  embed_id      : S.optional(Id.EmbedId),
  verification  : PlayerVerification,
  account_type  : S.String,
});

const Legacy = S.Struct({
  pk            : Id.UserId,
  sk            : Id.PlayerTag,
  type          : S.Literal('DiscordPlayer'),
  version       : S.Literal('1.0.0'),
  created       : S.Date,
  updated       : S.Date,
  gsi_user_id   : Id.UserId,
  gsi_player_tag: Id.PlayerTag,
  embed_id      : S.optional(Id.EmbedId),
  alias         : S.optional(S.String),
  verification  : S.Enums({none: 0, admin: 1, token: 2, developer: 3}),
  account_type  : S.String,
});

export const Versions = S.Union(
  Latest,
  decodeOrFail(Legacy, S.typeSchema(Latest), (enc) => E.gen(function* () {
    const player = yield* ClashOfClans.getPlayer(enc.gsi_player_tag);

    return Document.upgrade({
      _tag          : DataTag.USER_PLAYER,
      _ver          : 0,
      pk            : enc.pk,
      sk            : enc.sk,
      name          : player.name,
      account_type  : enc.account_type,
      gsi_user_id   : enc.gsi_user_id,
      gsi_player_tag: enc.gsi_player_tag,
      embed_id      : enc.embed_id,
      verification  : enc.verification as any,
    });
  })),
);

export const key = Key.make;
export const is = S.is(Latest);
export const item = Latest.make;
export const equal = S.equivalence(Latest);
export type Type = typeof Latest.Type;
export type Encoded = typeof Latest.Encoded;
export const putItem = Document.Put(Latest);
export const getItem = Document.GetUpgrade(Key, Versions);
export const deleteItem = Document.Delete(Key);
