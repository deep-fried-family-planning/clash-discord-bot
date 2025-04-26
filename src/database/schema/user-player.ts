import {asKey, asLatest, PlayerVerification, toLatest} from '#src/database/arch-schema/arch.ts';
import {PkSk, DataTag} from '#src/database/arch-schema/index.ts';
import {DiscordPlayer} from '#src/dynamo/schema/discord-player';
import {S} from '#src/internal/pure/effect.ts';
import {DateTime} from 'effect';

export const Key = asKey(
  DataTag.USER_PLAYER,
  PkSk.UserId,
  PkSk.PlayerTag,
  0,
);

export const Latest = asLatest(Key, {
  gsi_user_id   : PkSk.UserId,
  gsi_player_tag: PkSk.PlayerTag,
  embed_id      : S.optional(PkSk.EmbedId),
  verification  : PlayerVerification,
  account_type  : S.String,
});

export const Versions = S.Union(
  Latest,
  toLatest(Latest, DiscordPlayer, (enc) => {
    return {
      _tag          : Key.tag,
      version       : Key.latest,
      upgraded      : true,
      pk            : enc.pk,
      sk            : enc.sk,
      account_type  : enc.account_type,
      created       : DateTime.unsafeMake(enc.created),
      updated       : DateTime.unsafeMake(enc.updated),
      gsi_user_id   : enc.gsi_user_id,
      gsi_player_tag: enc.gsi_player_tag,
      embed_id      : enc.embed_id,
      verification  : enc.verification as any,
    };
  }),
);
