import type {DiscordMsg} from '#src/discord/types.ts';
import type {Boom} from '@hapi/boom';
import {dLinesS} from '#src/discord/helpers/markdown.ts';
import {COLOR, nColor} from '#src/constants/colors.ts';
import {LBUTTON_SUPPORT_SERVER} from '#src/discord/app-interactions/components/lbutton-support-server.ts';
import {CMP, MSG} from '#src/discord/helpers/re-exports.ts';
import {LBUTTON_ERROR_LOG} from '#src/discord/app-interactions/components/lbutton-error-log.ts';

export const eErrorReply = (e: Error | Boom, log: {contents: {channel_id: string; id: string}}): DiscordMsg => ({
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
        type      : CMP.ActionRow,
        components: [
            LBUTTON_SUPPORT_SERVER,
            LBUTTON_ERROR_LOG(log.contents.channel_id, log.contents.id),
        ],
    }],
});
