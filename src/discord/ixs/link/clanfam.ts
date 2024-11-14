import type {CommandSpec, IxDS, snflk} from '#src/discord/types.ts';
import {E, pipe} from '#src/internal/pure/effect.ts';
import {deleteDiscordClan, putDiscordClan, queryDiscordClan} from '#src/dynamo/discord-clan.ts';
import {getAliasTag} from '#src/clash/get-alias-tag.ts';
import {Clashofclans} from '#src/clash/api/clashofclans.ts';
import type {IxD} from '#src/discord/util/discord.ts';
import {COLOR, nColor} from '#src/internal/constants/colors.ts';
import {queryPlayersForUser} from '#src/dynamo/discord-player.ts';
import {mapL} from '#src/internal/pure/pure-list.ts';
import {OPTION_CLAN} from '#src/discord/ix-constants.ts';
import {validateServer} from '#src/discord/util/validation.ts';
import {replyError, SlashUserError} from '#src/internal/errors.ts';


// todo
// 1. disallow selection of countdown channel linked to other clan within same server


export const CLAN_FAM
    = {
        type       : 1,
        name       : 'clanfam',
        description: 'link clan to your discord server in deepfryer',
        options    : {
            ...OPTION_CLAN,
            countdown: {
                type       : 7,
                name       : 'countdown',
                description: 'oomgaboomga',
                required   : true,
            },
        },
    } as const satisfies CommandSpec;


/**
 * @desc [SLASH /clanfam]
 */
export const clanfam = (data: IxD, options: IxDS<typeof CLAN_FAM>) => E.gen(function * () {
    const [server, user] = yield * validateServer(data);

    if (!user.roles.includes(server.admin as snflk)) {
        return yield * new SlashUserError({issue: 'admin role required'});
    }

    const clanTag = yield * Clashofclans.validateTag(getAliasTag(options.clan));

    const clan = yield * Clashofclans.getClan(clanTag).pipe(replyError('clan does not exist.'));

    const playerLinks = pipe(
        yield * queryPlayersForUser({pk: user.user!.id}),
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
