import type {DiscordMsg} from '#src/discord/types.ts';
import {ActionRowBuilder, ButtonBuilder, ComponentBuilder, EmbedBuilder} from '@discordjs/builders';
import {COLOR, nColor} from '#src/constants/colors.ts';

export const MESSAGE_INFO = {
    embeds: [
        new EmbedBuilder()
            .setTitle('Deep Fried Family Planning')
            .setColor(nColor(COLOR.ORIGINAL))
            .setDescription('')
            .data,
    ],
    components: [
        new ActionRowBuilder()
            .addComponents([
                new ButtonBuilder()

                    .data,
            ])
            .data,
    ],

} satisfies DiscordMsg;
