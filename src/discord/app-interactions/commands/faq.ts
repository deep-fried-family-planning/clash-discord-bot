import {dLinesS} from '#src/discord/helpers/markdown.ts';
import {specCommand} from '#src/discord/command-pipeline/commands-spec.ts';
import {getServerReject} from '#src/database/server/get-server.ts';
import {notFound} from '@hapi/boom';
import {COLOR, nColor} from '#src/constants/colors.ts';
import {CMP} from '#src/discord/helpers/re-exports.ts';
import {LBUTTON_FAQ} from '#src/discord/app-interactions/components/lbutton-faq.ts';
import type {FAQ} from '#src/discord/app-interactions/commands/faq.cmd.ts';

export const faq = specCommand<typeof FAQ>(async (body) => {
    const server = await getServerReject(body.guild_id!);

    if (!server.urls.faq) {
        throw notFound('faq_url is not set for this server');
    }

    return {
        embeds: [{
            color      : nColor(COLOR.INFO),
            description: dLinesS(
                'Open the link button below to find answers to frequently asked questions.',
            ),
        }],
        components: [{
            type      : CMP.ActionRow,
            components: [
                LBUTTON_FAQ(server.urls.faq),
            ],
        }],
    };
});
