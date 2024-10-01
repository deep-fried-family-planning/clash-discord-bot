import {specCommand} from '#src/discord/command-pipeline/commands-spec.ts';
import {putServer} from '#src/database/server/put-server.ts';
import type {CONFIG_SERVER_EDIT} from '#src/discord/commands/config/server/server-edit.cmd.ts';
import {getServerReject} from '#src/database/server/get-server.ts';
import {validateAdminRole} from '#src/discord/command-util/validate-admin-role.ts';

export const configServerEdit = specCommand<typeof CONFIG_SERVER_EDIT>(async (body) => {
    const server = await getServerReject(body.guild_id!);

    validateAdminRole(server, body, `admin_role <@&${server.roles.admin}> required to make this edit`);

    const resolved = await putServer({
        ...server,
        roles: {
            ...server.roles,
            admin: body.data.options.admin_role?.value ?? server.roles.admin,
        },
        urls: {
            ...server.urls,
            faq: body.data.options.faq_url?.value ?? server.urls.faq,
        },
    });

    return {
        embeds: [{
            description: [
                `admin_role: <@&${resolved.roles.admin}>`,
                '',
                `faq page: ${resolved.urls.faq}`,
            ].join(''),
        }],
    };
});
