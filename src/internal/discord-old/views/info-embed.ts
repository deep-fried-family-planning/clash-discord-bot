import {FOOTER_LAST_UPDATED} from '#src/internal/discord-old/constants/footer.ts';
import type {DEmbed} from '#src/internal/discord-old/dynamo/schema/discord-embed.ts';
import type {Embed} from 'dfx/types';

export const viewInfoEmbed = (embed: DEmbed): Embed => {
  return {
    ...embed.embed,
    // @ts-expect-error fixed by JSON encoding
    footer: {
      ...embed.embed.footer,
      text: FOOTER_LAST_UPDATED,
    },
  };
};
