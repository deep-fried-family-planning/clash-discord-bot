import {specCommand} from '#src/discord/command-pipeline/commands-spec.ts';
import type {CONFIG_SERVER_ADD} from '#src/discord/commands/config/server/server-add.cmd.ts';
import {putServer} from '#src/data-store/server/put-server.ts';
import {SERVER_CODEC_LATEST} from '#src/data-store/codec/server-codec.ts';

export const configServerAdd = specCommand<typeof CONFIG_SERVER_ADD>(async (body) => {
    const server = await putServer({
        version    : SERVER_CODEC_LATEST,
        migrated   : false,
        id         : body.guild_id!,
        opinionated: 0,
        roles      : {
            admin: body.data.options.admin_role.value,
        },
        clans: {},
        urls : {
            home: '',
            faq : '',
        },
    });

    return {
        embeds: [{
            description: [
                `server ${server.id} added successfully with admin role: <@&${server.roles.admin}>`,
            ].join(''),
        }],
    };
});
