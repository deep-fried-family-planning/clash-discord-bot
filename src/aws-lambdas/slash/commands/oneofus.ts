import type {CommandSpec, Interaction} from '#src/discord/types.ts';
import {E} from '#src/internals/re-exports/effect.ts';
import {
    deleteDiscordPlayer,
    putDiscordPlayer,
    queryDiscordPlayer,
} from '#src/database/discord-player.ts';
import type {DPlayer} from '#src/database/discord-player.ts';
import type {ROptions} from '#src/aws-lambdas/slash/types.ts';
import {SlashUserError} from '#src/internals/errors/slash-error.ts';
import {ClashService} from '#src/internals/layers/clash-service.ts';
import {CMDT, OPT} from '#src/internals/re-exports/discordjs.ts';
import {validateServer} from '#src/aws-lambdas/slash/validation-utils.ts';

export const ONE_OF_US
    = {
        type       : CMDT.ChatInput,
        name       : 'oneofus',
        description: 'link clash account to discord',
        options    : {
            player_tag: {
                type       : OPT.String,
                name       : 'player_tag',
                description: 'tag for player in-game (ex. #2GR2G0PGG)',
                required   : true,
            },
            api_token: {
                type       : OPT.String,
                name       : 'api_token',
                description: 'player api token from in-game settings',
                required   : true,
            },
            discord_user: {
                type       : OPT.User,
                name       : 'discord_user',
                description: '[admin_role] discord user account to link player tag',
            },
        },
    } as const satisfies CommandSpec;

/**
 * @desc [SLASH /oneofus]
 */
export const oneofus = (data: Interaction, options: ROptions<typeof ONE_OF_US>) => E.gen(function * () {
    const [server, user] = yield * validateServer(data);

    const clash = yield * ClashService;

    const tag = yield * clash.validateTag(options.player_tag);

    const coc_player = yield * clash.getPlayer(tag);

    // server admin role link
    if (options.api_token === 'admin') {
        if (!user.roles.includes(server.admin)) {
            return yield * new SlashUserError({issue: 'admin role required'});
        }
        if (!options.discord_user) {
            return yield * new SlashUserError({issue: 'admin links must have discord_user'});
        }

        const [player, ...rest] = yield * queryDiscordPlayer({sk: `player-${options.player_tag}`});

        if (rest.length) {
            return yield * new SlashUserError({issue: 'real bad, this should never happen. call support lol'});
        }

        if (!player) {
            yield * putDiscordPlayer(makeDiscordPlayer(options.discord_user, coc_player.tag, 1));
            return {embeds: [{description: 'admin link successful'}]};
        }

        yield * deleteDiscordPlayer({pk: player.pk, sk: player.sk});
        yield * putDiscordPlayer({
            ...player,
            pk          : `user-${user.user.id}`,
            gsi_user_id : `user-${user.user.id}`,
            updated     : new Date(Date.now()),
            verification: 1,
        });

        return {embeds: [{description: 'admin link successful'}]};
    }

    // COC player API token validity
    const tokenValid = yield * clash.verifyPlayerToken(coc_player.tag, options.api_token);

    if (!tokenValid) {
        return yield * new SlashUserError({issue: 'invalid api_token'});
    }

    const [player, ...rest] = yield * queryDiscordPlayer({sk: `player-${options.player_tag}`});

    // new player record
    if (!player) {
        yield * putDiscordPlayer(makeDiscordPlayer(user.user.id, coc_player.tag, 2));

        return {embeds: [{description: 'new player link verified'}]};
    }

    if (rest.length) {
        return yield * new SlashUserError({issue: 'real bad, this should never happen. call support lol'});
    }

    // already linked to current account
    if (player.sk === coc_player.tag) {
        return yield * new SlashUserError({issue: 'your account is already linked'});
    }

    // disallow higher verification override
    if (player.verification > 2) {
        return yield * new SlashUserError({issue: 'cannot override verification already present'});
    }

    // update player record
    yield * deleteDiscordPlayer({pk: player.pk, sk: player.sk});
    yield * putDiscordPlayer({
        ...player,
        pk          : `user-${user.user.id}`,
        gsi_user_id : `user-${user.user.id}`,
        updated     : new Date(Date.now()),
        verification: 2,
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
