import type {DEmbed} from '#src/dynamo/schema/discord-embed.ts';
import type {Embed} from 'dfx/types';


export const viewInfoEmbed = (embed: DEmbed): Embed => {
    return {
        ...embed.embed,
        // @ts-expect-error fixed by JSON encoding
        footer: {
            ...embed.embed.footer,
            text: 'last updated',
        },
    };
};
