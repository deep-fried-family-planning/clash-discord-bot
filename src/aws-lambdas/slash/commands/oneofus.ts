import {ddbGetPlayerLinks, ddbPutPlayerLinks} from '#src/database/codec/player-links-ddb.ts';
import {PLAYER_LINKS_CODEC_LATEST} from '#src/database/codec/player-links-codec.ts';
import {getServerReject} from '#src/database/server/get-server.ts';
import {validateAdminRole} from '#src/discord/command-util/validate-admin-role.ts';
import {badRequest, notFound} from '@hapi/boom';
import {discord} from '#src/https/api-discord.ts';
import {api_coc} from '#src/https/api-coc.ts';
import {COLOR, nColor} from '#src/constants/colors.ts';
import {ApplicationCommandOptionType, ApplicationCommandType} from '@discordjs/core/http-only';
import type {CommandSpec, Interaction, OptionData} from '#src/discord/types.ts';
import {E, pipe} from '#src/utils/effect';
import {getDiscordServer} from '#src/database/discord-server.ts';
import type {Embed} from 'dfx/types';
import {getDiscordPlayer, putDiscordPlayer} from '#src/database/discord-player.ts';
import type {ResourceNotFoundException} from '@aws-sdk/client-dynamodb';

export const ONE_OF_US = {
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

type ROptions<T extends CommandSpec> = OptionData<T['options']>;

// fullstack test
//
//
//
//
//  adrian needs to get his AWS creds and shit
//  i need to make an ephemeral role / increase dynamo permissions in qual
//
//
//
export const oneofus = (data: Interaction, options: ROptions<typeof ONE_OF_US>) => E.gen(function * () {
    const tag = api_coc.util.formatTag(options.player_tag);

    if (!api_coc.util.isValidTag(tag)) {
        yield * E.fail(new Error('invalid tag'));
    }

    const coc_player = yield * E.promise(async () => await api_coc.getPlayer(tag));

    if (options.api_token === 'admin') {
        if (!options.discord_user) {
            yield * E.fail(new Error('must have discord_user defined'));
        }

        const server = yield * getDiscordServer({
            pk: `server-${data.guild_id}`,
            sk: 'now',
        });

        if (!data.member!.roles.includes(server.admin)) {
            yield * E.fail(new Error('admin role required'));
        }

        yield * putDiscordPlayer({
            pk            : `user-${data.member!.user.id}`,
            sk            : `player-${coc_player.tag}`,
            type          : 'DiscordPlayer',
            version       : '1.0.0',
            created       : new Date(Date.now()),
            updated       : new Date(Date.now()),
            gsi_user_id   : `user-${data.member!.user.id}`,
            gsi_player_tag: `player-${coc_player.tag}`,
            verification  : 2,
        });

        return {
            embeds: [{
                description: 'admin link',
            }],
        };
    }

    const player = yield * pipe(
        getDiscordPlayer({
            pk: `user-${data.member!.user.id}`,
            sk: options.player_tag,
        }),
        E.catchTag('ResourceNotFoundException', () => E.succeed(undefined)),
    );

    if (player) {
        yield * E.fail(new Error('player link already exists'));
    }

    const tokenIsValid = yield * E.promise(async () => await api_coc.verifyPlayerToken(coc_player.tag, options.api_token));

    if (!tokenIsValid) {
        yield * E.fail(new Error('invalid api_token'));
    }

    yield * putDiscordPlayer({
        pk            : `user-${data.member!.user.id}`,
        sk            : `player-${coc_player.tag}`,
        type          : 'DiscordPlayer',
        version       : '1.0.0',
        created       : new Date(Date.now()),
        updated       : new Date(Date.now()),
        gsi_user_id   : `user-${data.member!.user.id}`,
        gsi_player_tag: `player-${coc_player.tag}`,
        verification  : 2,
    });

    return {
        embeds: [{
            description: 'noice',
        }],
    };
});
