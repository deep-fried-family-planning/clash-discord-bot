import {specCommand} from '#src/discord/command-pipeline/commands-spec.ts';
import type {CONFIG_SERVER_ADD} from '#src/discord/app-interactions/commands/config/server/server-add.cmd.ts';
import {putServer} from '#src/database/server/put-server.ts';
import {SERVER_CODEC_LATEST} from '#src/database/codec/server-codec.ts';
import {COLOR, nColor} from '#src/constants/colors.ts';

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
            color      : nColor(COLOR.SUCCESS),
            description: [
                `server ${server.id} added successfully with admin role: <@&${server.roles.admin}>`,
            ].join(''),
        }],
    };
});
