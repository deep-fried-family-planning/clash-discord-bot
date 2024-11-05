import {ApplicationCommandOptionType, ApplicationCommandType} from '@discordjs/core/http-only';
import type {CommandSpec, Interaction} from '#src/discord/types.ts';
import type {ROptions} from '#src/aws-lambdas/slash/types.ts';
import {E} from '#src/utils/effect.ts';
import {putDiscordServer} from '#src/database/discord-server.ts';

export const SERVER
    = {
        type       : ApplicationCommandType.ChatInput,
        name       : 'server',
        description: 'link discord server to deepfryer',
        options    : {
            admin: {
                type       : ApplicationCommandOptionType.Role,
                name       : 'admin',
                description: 'oomgaboomga',
                required   : true,
            },
            forum: {
                type       : ApplicationCommandOptionType.Channel,
                name       : 'forum',
                description: 'oomgaboomga',
                required   : true,
            },
        },
    } as const satisfies CommandSpec;

/**
 * @desc [SLASH /server]
 */
export const server = (data: Interaction, options: ROptions<typeof SERVER>) => E.gen(function * () {
    yield * putDiscordServer({
        pk               : `server-${data.guild_id}`,
        sk               : 'now',
        type             : 'DiscordServer',
        version          : '1.0.0',
        admin            : options.admin,
        forum            : options.forum,
        created          : new Date(Date.now()),
        updated          : new Date(Date.now()),
        gsi_all_server_id: `server-${data.guild_id}`,
        polling          : true,
    });

    return {
        embeds: [{description: 'ya did the thing'}],
    };
});
