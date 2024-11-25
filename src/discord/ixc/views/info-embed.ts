import type {DEmbed} from '#src/dynamo/schema/discord-embed.ts';
import {pipe} from '#src/internal/pure/effect.ts';
import {omit} from 'effect/Struct';
import type {Embed} from 'dfx/types';


export const viewInfoEmbed = (embed: DEmbed): Embed => {
    const next = pipe(
        embed,
        omit('type', 'embed_type'),
    );

    return {
        title      : next.title!,
        description: next.description!,
        timestamp  : next.updated.toISOString(),

        // @ts-expect-error fixed by JSON encoding
        footer: {
            ...next.footer,
            text: 'last updated',
        },
    };
};
