import type {DiscordMessage} from '#src/discord/types.ts';
import type {Boom} from '@hapi/boom';
import {dLinesS} from '#src/discord/helpers/markdown.ts';
import {COLOR, nColor} from '#src/constants/colors.ts';
import {ButtonStyle, ComponentType} from 'discord-api-types/v10';

export const eErrorReply = (e: Error | Boom, log: {contents: {channel_id: string; id: string}}): DiscordMessage => ({
    embeds: [{
        color: nColor(COLOR.ERROR),

        title: 'isBoom' in e
            ? `${e.name}: ${e.message}`
            : 'Error: Unknown',

        description: dLinesS(
            'DeepFryer will retry shortly.',

            `If the error persists, send this link to the support server:`,
            `<https://discord.com/channels/1283847240061947964/${log.contents.channel_id}/${log.contents.id}>`,
        ),
    }],
    components: [{
        type      : ComponentType.ActionRow,
        components: [{
            type : ComponentType.Button,
            style: ButtonStyle.Link,
            label: 'Support Server',
            url  : 'https://discord.gg/KfpCtU2rwY',
        }],
    }],
});
