import type {COMMANDS} from '#src/discord/commands.ts';
import {specCommand} from '#src/discord/command-pipeline/commands-spec.ts';
import {getServerReject} from '#src/data-store/server/get-server.ts';
import {notFound} from '@hapi/boom';
import {validateAdminRole} from '#src/discord/command-util/validate-admin-role.ts';

export const smoke = specCommand<typeof COMMANDS.SMOKE>(async (body) => {
    const server = await getServerReject(body.guild_id!);

    validateAdminRole(server, body, 'must be admin role');

    if (!server.urls.faq) {
        throw notFound('faq_url is not set for this server');
    }

    return {
        embeds: [{
            description: JSON.stringify(server),
        }],
    };
});
