import type {COMMANDS} from '#src/discord/commands.ts';
import {dLines} from '#src/discord/command-util/message.ts';
import {specCommand} from '#src/discord/command-pipeline/commands-spec.ts';
import {getServerReject} from '#src/data-store/server/get-server.ts';
import {notFound} from '@hapi/boom';

export const faq = specCommand<typeof COMMANDS.FAQ>(async (body) => {
    const server = await getServerReject(body.guild_id!);

    if (!server.urls.faq) {
        throw notFound('faq_url is not set for this server');
    }

    return {
        embeds: [{
            description: dLines([
                'Open this link to find answers to frequently asked questions:',
                '',
                server.urls.faq,
            ]).join(''),
        }],
    };
});
