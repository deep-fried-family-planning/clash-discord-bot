import {DataTag} from '#src/database/arch-data/constants/index.ts';
import {Id} from '#src/database/arch-data/id.ts';
import {asKey, asLatest, toLatest} from '#src/database/arch-data/standard.ts';
import {DiscordPlayer} from '#src/internal/discord-old/dynamo/schema/discord-player.ts';
import {S} from '#src/internal/pure/effect.ts';
import {DateTime} from 'effect';

export const PlayerVerification = S.Enums({
  none     : 0,
  admin    : 1,
  token    : 2,
  developer: 3,
} as const);

export const Key = asKey(
  DataTag.USER_PLAYER,
  Id.UserId,
  Id.PlayerTag,
  0,
);

export const Latest = asLatest(Key, {
  name          : S.String,
  gsi_user_id   : Id.UserId,
  gsi_player_tag: Id.PlayerTag,
  embed_id      : S.optional(Id.EmbedId),
  verification  : PlayerVerification,
  account_type  : S.String,
});

export const Versions = S.Union(
  Latest,
  toLatest(Latest, DiscordPlayer, (enc) => {
    return {
      _tag          : Key._tag,
      version       : Key.latest,
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
    };
  }),
);
