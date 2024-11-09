import {ApplicationCommandOptionType, ApplicationCommandType} from '@discordjs/core/http-only';
import type {CommandSpec, Interaction} from '#src/aws-lambdas/menu/old/types.ts';
import type {CmdOps} from '#src/aws-lambdas/slash/types.ts';
import {E} from '#src/internals/re-exports/effect.ts';
import {putDiscordServer} from '#src/database/discord-server.ts';
import {OPTION_TZ} from '#src/aws-lambdas/slash/options.ts';

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
            tz: {
                ...OPTION_TZ.tz,
            },
        },
    } as const satisfies CommandSpec;

/**
 * @desc [SLASH /server]
 */
export const server = (data: Interaction, options: CmdOps<typeof SERVER>) => E.gen(function * () {
    yield * putDiscordServer({
        pk               : `s-${data.guild_id}`,
        sk               : 'now',
        type             : 'DiscordServer',
        version          : '1.0.0',
        admin            : options.admin,
        forum            : options.forum,
        created          : new Date(Date.now()),
        updated          : new Date(Date.now()),
        gsi_all_server_id: `s-${data.guild_id}`,
        polling          : true,
    });

    return {
        embeds: [{description: 'ya did the thing'}],
    };
});
