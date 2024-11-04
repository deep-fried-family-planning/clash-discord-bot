import {api_coc} from '#src/https/api-coc.ts';
import {ApplicationCommandOptionType, ApplicationCommandType} from '@discordjs/core/http-only';
import type {CommandSpec, Interaction} from '#src/discord/types.ts';
import {E, pipe} from '#src/utils/effect';
import {failGetDiscordServer, getDiscordServer} from '#src/database/discord-server.ts';
import {getDiscordPlayer, putDiscordPlayer} from '#src/database/discord-player.ts';
import type {DPlayer} from '#src/database/discord-player.ts';
import type {ROptions} from '#src/aws-lambdas/slash/types.ts';

export const ONE_OF_US
    = {
        type       : ApplicationCommandType.ChatInput,
        name       : 'oneofus',
        description: 'link clash account to discord',
        options    : {
            player_tag: {
                type       : ApplicationCommandOptionType.String,
                name       : 'player_tag',
                description: 'tag for player in-game (ex. #2GR2G0PGG)',
                required   : true,
            },
            api_token: {
                type       : ApplicationCommandOptionType.String,
                name       : 'api_token',
                description: 'player api token from in-game settings',
                required   : true,
            },
            discord_user: {
                type       : ApplicationCommandOptionType.User,
                name       : 'discord_user',
                description: '[admin_role] discord user account to link player tag',
            },
        },
    } as const satisfies CommandSpec;

/**
 * @desc [SLASH /oneofus]
 */
export const oneofus = (data: Interaction, options: ROptions<typeof ONE_OF_US>) => E.gen(function * () {
    if (!data.member) {
        return yield * E.fail(new Error('contextual discord authentication failed'));
    }

    const server = yield * pipe(
        getDiscordServer({pk: `server-${data.guild_id}`, sk: 'now'}),
        E.flatMap(failGetDiscordServer),
    );

    const tag = `#${options.player_tag.toUpperCase().replace(/O/g, '0').replace(/^#/g, '').replace(/\s/g, '')}`;

    if (/^#?[0289PYLQGRJCUV]$/.test(tag)) {
        return yield * E.fail(new Error('invalid tag'));
    }

    const coc_player = yield * E.promise(async () => await api_coc.getPlayer(tag));

    // server admin role link
    if (options.api_token === 'admin') {
        if (!data.member.roles.includes(server.admin)) {
            return yield * E.fail(new Error('admin role required'));
        }
        if (!options.discord_user) {
            return yield * E.fail(new Error('admin links must have discord_user'));
        }

        const player = yield * getDiscordPlayer({pk: `user-${data.member.user.id}`, sk: `player-${options.player_tag}`});
        const newPlayer = makeDiscordPlayer(options.discord_user, coc_player.tag, 1);

        yield * putDiscordPlayer({
            ...newPlayer,
            created: player
                ? player.created
                : newPlayer.created,
        });

        return {embeds: [{description: 'admin link successful'}]};
    }

    // COC player API token validity
    const tokenValid = yield * E.promise(async () => await api_coc.verifyPlayerToken(coc_player.tag, options.api_token));

    if (!tokenValid) {
        return yield * E.fail(new Error('invalid api_token'));
    }

    const player = yield * getDiscordPlayer({pk: `user-${data.member.user.id}`, sk: `player-${options.player_tag}`});

    // new player record
    if (!player) {
        yield * putDiscordPlayer(makeDiscordPlayer(data.member.user.id, coc_player.tag, 2));

        return {embeds: [{description: 'new player link verified'}]};
    }

    // already linked to current account
    if (player.sk === coc_player.tag) {
        return yield * E.fail(new Error('your account is already linked'));
    }

    // disallow higher verification override
    if (player.verification > 2) {
        return yield * E.fail(new Error('cannot override verification already present'));
    }

    // update player record
    yield * putDiscordPlayer({
        ...makeDiscordPlayer(data.member.user.id, coc_player.tag, 2),
        created: new Date(Date.now()),
    });

    return {embeds: [{description: 'player link overridden'}]};
});

const makeDiscordPlayer
    = (userId: string, playerTag: string, verification: DPlayer['verification']) => ({
        pk            : `user-${userId}`,
        sk            : `player-${playerTag}`,
        type          : 'DiscordPlayer',
        version       : '1.0.0',
        created       : new Date(Date.now()),
        updated       : new Date(Date.now()),
        gsi_user_id   : `user-${userId}`,
        gsi_player_tag: `player-${playerTag}`,
        verification  : verification,
    } as const);
