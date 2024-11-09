import type {CommandSpec, Interaction} from '#src/aws-lambdas/menu/old/types.ts';
import {E} from '#src/internals/re-exports/effect.ts';
import {
    deleteDiscordPlayer,
    putDiscordPlayer,
    queryDiscordPlayer,
} from '#src/database/discord-player.ts';
import type {DPlayer} from '#src/database/discord-player.ts';
import type {CmdOps} from '#src/aws-lambdas/slash/types.ts';
import {SlashUserError} from '#src/internals/errors/slash-error.ts';
import {ClashperkService} from '#src/internals/layers/clashperk-service.ts';
import {CMDT, CMDOPT} from '#src/internals/re-exports/discordjs.ts';
import {validateServer} from '#src/aws-lambdas/slash/utils.ts';

export const ONE_OF_US
    = {
        type       : CMDT.ChatInput,
        name       : 'oneofus',
        description: 'link clash account to discord',
        options    : {
            player_tag: {
                type       : CMDOPT.String,
                name       : 'player_tag',
                description: 'tag for player in-game (ex. #2GR2G0PGG)',
                required   : true,
            },
            api_token: {
                type       : CMDOPT.String,
                name       : 'api_token',
                description: 'player api token from in-game settings',
                required   : true,
            },
            account_type: {
                type       : CMDOPT.String,
                name       : 'account_kind',
                description: 'how the account is played',
                choices    : [
                    {name: 'main', value: 'main'},
                    {name: 'alt', value: 'alt'},
                    {name: 'donation', value: 'donation'},
                    {name: 'war asset', value: 'war-asset'},
                    {name: 'clan capital', value: 'clan-capital'},
                    {name: 'strategic rush', value: 'strategic-rush'},
                ],
            },
            discord_user: {
                type       : CMDOPT.User,
                name       : 'discord_user',
                description: '[admin_role] discord user account to link player tag',
            },
        },
    } as const satisfies CommandSpec;

/**
 * @desc [SLASH /oneofus]
 */
export const oneofus = (data: Interaction, options: CmdOps<typeof ONE_OF_US>) => E.gen(function * () {
    const [server, user] = yield * validateServer(data);

    const clash = yield * ClashperkService;

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

        const [player, ...rest] = yield * queryDiscordPlayer({sk: `p-${options.player_tag}`});

        if (rest.length) {
            return yield * new SlashUserError({issue: 'real bad, this should never happen. call support lol'});
        }

        if (!player) {
            yield * putDiscordPlayer(makeDiscordPlayer(options.discord_user, coc_player.tag, 1, options.account_type));
            return {embeds: [{description: 'admin link successful'}]};
        }

        yield * deleteDiscordPlayer({pk: player.pk, sk: player.sk});
        yield * putDiscordPlayer({
            ...player,
            pk          : `u-${user.user.id}`,
            gsi_user_id : `u-${user.user.id}`,
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

    const [player, ...rest] = yield * queryDiscordPlayer({sk: `p-${options.player_tag}`});

    // new player record
    if (!player) {
        yield * putDiscordPlayer(makeDiscordPlayer(user.user.id, coc_player.tag, 2, options.account_type));

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
        pk          : `u-${user.user.id}`,
        gsi_user_id : `u-${user.user.id}`,
        updated     : new Date(Date.now()),
        verification: 2,
    });

    return {embeds: [{description: 'player link overridden'}]};
});

const makeDiscordPlayer
    = (userId: string, playerTag: string, verification: DPlayer['verification'], accountType?: string) => ({
        pk            : `u-${userId}`,
        sk            : `p-${playerTag}`,
        type          : 'DiscordPlayer',
        version       : '1.0.0',
        created       : new Date(Date.now()),
        updated       : new Date(Date.now()),
        gsi_user_id   : `u-${userId}`,
        gsi_player_tag: `p-${playerTag}`,
        verification  : verification,
        account_type  : accountType ?? 'main',
    } as const);
