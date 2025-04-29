import {DataTag} from '#src/database/arch/const/index.ts';
import {Id} from '#src/database/arch/id.ts';
import {declareKey, declareLatest, transformLatest} from '#src/database/arch/arch.ts';
import {DiscordEmbed} from '#src/internal/discord-old/dynamo/schema/discord-embed.ts';
import {S} from '#src/internal/pure/effect.ts';
import {DateTime} from 'effect';

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
