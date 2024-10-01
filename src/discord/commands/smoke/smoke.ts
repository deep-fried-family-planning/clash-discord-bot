import type {COMMANDS} from '#src/discord/commands.ts';
import {specCommand} from '#src/discord/command-pipeline/commands-spec.ts';
import {getServerReject} from '#src/database/server/get-server.ts';
import {validateAdminRole} from '#src/discord/command-util/validate-admin-role.ts';

export const smoke = specCommand<typeof COMMANDS.SMOKE>(async (body) => {
    const server = await getServerReject(body.guild_id!);

    validateAdminRole(server, body, 'must be admin role');

    return {
        embeds: [{
            description: JSON.stringify(server),
        }],
    };
});
