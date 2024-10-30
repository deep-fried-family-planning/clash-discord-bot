import {specCommand} from '#src/discord/command-pipeline/commands-spec.ts';
import {getAliasTag} from '#src/discord/command-util/get-alias-tag.ts';
import {COLOR, nColor} from '#src/constants/colors.ts';
import {dLinesS} from '#src/discord/helpers/markdown.ts';
import {getServerReject} from '#src/database/server/get-server.ts';
import {putServer} from '#src/database/server/put-server.ts';

import type {CONFIG_SERVER_ADDCLAN} from '#src/discord/app-interactions/commands/config/server/server-addclan.cmd.ts';
import {SERVER_RECORD} from '#src/database/schema/server-record.ts';

export const configServerAddclan = specCommand<typeof CONFIG_SERVER_ADDCLAN>(async (body) => {
    const tag = getAliasTag(body.data.options.clan);

    const server = await getServerReject(body.guild_id!);

    await putServer(SERVER_RECORD.make({
        ...server,
        clans: {
            ...server.clans,
            [tag]: {
                war_status           : 0,
                war_countdown_channel: body.data.options.countdown,
                war_prep_opponent    : '',
                war_prep_thread      : '',
                war_battle_opponent  : '',
                war_battle_thread    : '',
            },
        },
    }));

    return {
        embeds: [{
            color      : nColor(COLOR.SUCCESS),
            description: dLinesS(
                tag,
            ),
        }],
    };
});
