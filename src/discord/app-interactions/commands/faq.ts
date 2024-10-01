import type {COMMANDS} from '#src/discord/commands.ts';
import {dLines} from '#src/discord/helpers/markdown.ts';
import {specCommand} from '#src/discord/command-pipeline/commands-spec.ts';
import {getServerReject} from '#src/database/server/get-server.ts';
import {notFound} from '@hapi/boom';
import {COLOR, nColor} from '#src/constants/colors.ts';

export const faq = specCommand<typeof COMMANDS.FAQ>(async (body) => {
    const server = await getServerReject(body.guild_id!);

    if (!server.urls.faq) {
        throw notFound('faq_url is not set for this server');
    }

    return {
        embeds: [{
            color      : nColor(COLOR.INFO),
            description: dLines([
                'Open this link to find answers to frequently asked questions:',
                '',
                server.urls.faq,
            ]).join(''),
        }],
    };
});
