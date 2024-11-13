import type {CommandSpec, Interaction} from '#src/aws-lambdas/discord_menu/old/types.ts';
import type {CmdOps} from '#src/aws-lambdas/discord_slash/types.ts';
import {E, pipe} from '#src/internals/re-exports/effect.ts';
import {deleteDiscordClan, putDiscordClan, queryDiscordClan} from '#src/dynamo/discord-clan.ts';
import {getAliasTag} from '#src/aws-lambdas/discord_menu/old/get-alias-tag.ts';
import {Clashofclans} from '#src/internals/layer-api/clashofclans.ts';
import {CMDT, CMDOPT} from '#src/internals/re-exports/discordjs.ts';
import {replyError, SlashUserError} from '#src/internals/errors/slash-error.ts';
import {validateServer} from '#src/aws-lambdas/discord_slash/utils.ts';
import {OPTION_CLAN} from '#src/aws-lambdas/discord_slash/options.ts';
import {COLOR, nColor} from '#src/internals/constants/colors.ts';
import {queryPlayersForUser} from '#src/dynamo/discord-player.ts';
import {mapL} from '#src/pure/pure-list.ts';

export const CLAN_FAM
    = {
        type       : CMDT.ChatInput,
        name       : 'clanfam',
        description: 'link clan to your discord server in deepfryer',
        options    : {
            ...OPTION_CLAN,
            countdown: {
                type       : CMDOPT.Channel,
                name       : 'countdown',
                description: 'oomgaboomga',
                required   : true,
            },
        },
    } as const satisfies CommandSpec;

/**
 * @desc [SLASH /clanfam]
 */
export const clanfam = (data: Interaction, options: CmdOps<typeof CLAN_FAM>) => E.gen(function * () {
    const [server, user] = yield * validateServer(data);

    if (!user.roles.includes(server.admin)) {
        return yield * new SlashUserError({issue: 'admin role required'});
    }

    const clanTag = yield * Clashofclans.validateTag(getAliasTag(options.clan));

    const clan = yield * Clashofclans.getClan(clanTag).pipe(replyError('clan does not exist.'));

    const playerLinks = pipe(
        yield * queryPlayersForUser({pk: user.user.id}),
        mapL((pL) => pL.sk),
    );

    const leader = clan.members.find((m) => m.isLeader)?.tag;
    const coleaders = clan.members.filter((m) => m.isCoLeader).map((m) => m.tag);
    const elders = clan.members.filter((m) => m.isElder).map((m) => m.tag);

    const verification
        = playerLinks.includes(`${leader}`) ? 3
        : playerLinks.some((sk) => coleaders.includes(sk)) ? 2
        : playerLinks.some((sk) => elders.includes(sk)) ? 1
        : 0;

    const [discordClan, ...rest] = yield * queryDiscordClan({sk: clanTag});

    if (rest.length) {
        return yield * new SlashUserError({issue: 'real bad, this should never happen. call support lol'});
    }

    if (discordClan) {
        if (discordClan.verification > verification) {
            return yield * new SlashUserError({issue: 'your linked player tags cannot override this clan link'});
        }

        yield * deleteDiscordClan({pk: discordClan.pk, sk: discordClan.sk});

        const newClan = yield * putDiscordClan({
            ...discordClan,
            updated     : new Date(Date.now()),
            pk          : server.pk,
            verification: verification,
        });

        return {embeds: [{
            color      : nColor(COLOR.SUCCESS),
            description: `server ${data.guild_id} linked ${clan.name} (${clan.tag})\n${JSON.stringify(newClan, null, 2)}`,
        }]};
    }

    const newClan = yield * putDiscordClan({
        pk             : data.guild_id!,
        sk             : clan.tag,
        type           : 'DiscordClan',
        version        : '1.0.0',
        created        : new Date(Date.now()),
        updated        : new Date(Date.now()),
        gsi_server_id  : data.guild_id!,
        gsi_clan_tag   : clanTag,
        thread_prep    : '',
        prep_opponent  : '',
        thread_battle  : '',
        battle_opponent: '',
        verification   : verification,
        countdown      : options.countdown,
    });

    return {
        embeds: [{
            color      : nColor(COLOR.SUCCESS),
            description: `server ${data.guild_id} linked ${clan.name} (${clan.tag})\n${JSON.stringify(newClan, null, 2)}`,
        }],
    };
});
