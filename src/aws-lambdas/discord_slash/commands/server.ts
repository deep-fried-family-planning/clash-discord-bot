import {ApplicationCommandOptionType, ApplicationCommandType} from '@discordjs/core/http-only';
import type {CommandSpec, Interaction} from '#src/aws-lambdas/discord_menu/old/types.ts';
import type {CmdOps} from '#src/aws-lambdas/discord_slash/types.ts';
import {E} from '#src/internals/re-exports/effect.ts';
import {putDiscordServer} from '#src/dynamo/discord-server.ts';
import {OPTION_TZ} from '#src/aws-lambdas/discord_slash/options.ts';
import {COLOR, nColor} from '#src/internals/constants/colors.ts';
import {validateServer} from '#src/aws-lambdas/discord_slash/utils.ts';
import {SlashUserError} from '#src/internals/errors/slash-error.ts';
import {dLinesS} from '#src/aws-lambdas/discord_menu/old/markdown.ts';

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
    const [server, user] = yield * validateServer(data).pipe(E.catchAll(() => E.succeed([undefined, data.member!] as const)));

    if (server) {
        if (!user.roles.includes(server.admin)) {
            return yield * new SlashUserError({issue: `role required: <@&${server.admin}>`});
        }

        yield * putDiscordServer({
            ...server,
            updated: new Date(Date.now()),
            admin  : options.admin,
            forum  : options.forum,
        });

        return {embeds: [{
            color      : nColor(COLOR.SUCCESS),
            description: dLinesS(
                'server link updated',
            ),
        }]};
    }

    yield * putDiscordServer({
        pk               : data.guild_id!,
        sk               : 'now',
        type             : 'DiscordServer',
        version          : '1.0.0',
        admin            : options.admin,
        forum            : options.forum,
        created          : new Date(Date.now()),
        updated          : new Date(Date.now()),
        gsi_all_server_id: data.guild_id!,
        polling          : true,
    });

    return {
        embeds: [{
            color      : nColor(COLOR.SUCCESS),
            description: 'new server link created',
        }],
    };
});
