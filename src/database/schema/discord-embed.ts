import {asKey, asLatest, toLatest} from '#src/database/arch-schema/arch.ts';
import {DataTag, PkSk} from '#src/database/arch-schema/index.ts';
import {DiscordEmbed} from '#src/dynamo/schema/discord-embed';
import {S} from '#src/internal/pure/effect.ts';
import {DateTime} from 'effect';

export const Key = asKey(
  DataTag.DISCORD_EMBED,
  PkSk.EmbedId,
  PkSk.NowSk,
  0,
);

export const Latest = asLatest(Key, {
  gsi_embed_id: PkSk.EmbedId,
  data        : DiscordEmbed.fields.embed,
});

export const Versions = S.Union(
  Latest,
  toLatest(Latest, DiscordEmbed, (enc) => {
    return {
      _tag        : Key.tag,
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
