import type {COMMANDS} from '#src/discord/commands.ts';
import {api_coc} from '#src/lambdas/client-api-coc.ts';
import {specCommand} from '#src/discord/command-pipeline/commands-spec.ts';
import {ddbGetPlayerLinks, ddbPutPlayerLinks} from '#src/data-store/codec/player-links-ddb.ts';
import {PLAYER_LINKS_CODEC_LATEST} from '#src/data-store/codec/player-links-codec.ts';
import {getServerReject} from '#src/data-store/server/get-server.ts';
import {validateAdminRole} from '#src/discord/command-util/validate-admin-role.ts';
import {badRequest, notFound} from '@hapi/boom';
import {discord} from '#src/api/api-discord.ts';

export const oneofus = specCommand<typeof COMMANDS.ONE_OF_US>(async (body) => {
    const server = await getServerReject(body.guild_id!);

    const tag = body.data.options.player_tag.value;

    if (!api_coc.util.isValidTag(tag)) {
        throw badRequest(`${tag} is not a valid player tag`);
    }

    if (body.data.options.discord_user?.value) {
        if (body.data.options.api_token.value !== 'admin') {
            throw badRequest('api_token must be set to "admin" to admin override verified player link');
        }

        validateAdminRole(server, body, `admin_role <@&${server.roles.admin}> required to admin override verified player link`);
    }

    const links = await ddbGetPlayerLinks();

    if (!links) {
        await ddbPutPlayerLinks({
            id      : 'player-links',
            version : PLAYER_LINKS_CODEC_LATEST,
            migrated: false,
            players : {},
            users   : {},
        });

        return [{desc: ['links initialized for this environment, please run this command again.']}];
    }

    const user = body.data.options.discord_user?.value ?? body.user!.id;

    if (tag in links.players && links.players[tag].user !== user && links.players[tag].verified) {
        const serverMembers = await discord.guilds.getMembers(body.guild_id!, {limit: 1000});

        if (!serverMembers.map((m) => m.user.id).includes(user)) {
            throw notFound(`user <@${user}> must be present in this server to admin override verified player link`);
        }

        const player = await api_coc.getPlayer(tag);

        await ddbPutPlayerLinks({
            ...links,
            players: {
                ...links.players,
                [tag]: {
                    user,
                    verified: 1,
                },
            },
        });

        return [{
            desc: [
                `player ${tag} ${player.name} successfully linked to <@${user}> via admin override`,
            ],
        }];
    }

    const player = await api_coc.getPlayer(tag);
    const verified = await api_coc.verifyPlayerToken(tag, body.data.options.api_token.value);

    if (body.data.options.api_token.value !== 'admin' && !verified) {
        throw notFound(`incorrect token for player tag ${tag} ${player.name}`);
    }

    await ddbPutPlayerLinks({
        ...links,
        players: {
            ...links.players,
            [tag]: {
                user,
                verified: 1,
            },
        },
    });

    return [{
        desc: [
            `player ${tag} ${player.name} successfully linked to <@${user}>`,
        ],
    }];
});
