import {specCommand} from '#src/discord/command-pipeline/commands-spec.ts';
import type {CONFIG_SERVER_ADD} from '#src/discord/app-interactions/commands/config/server/server-add.cmd.ts';
import {putServer} from '#src/database/server/put-server.ts';
import {SERVER_CODEC_LATEST} from '#src/database/codec/server-codec.ts';
import {COLOR, nColor} from '#src/constants/colors.ts';

export const configServerAdd = specCommand<typeof CONFIG_SERVER_ADD>(async (body) => {
    const server = await putServer({
        version: SERVER_CODEC_LATEST,
        id     : body.guild_id!,
        roles  : {
            admin: body.data.options.admin_role,
        },
        channels: {
            war_room: body.data.options.war_room,
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
