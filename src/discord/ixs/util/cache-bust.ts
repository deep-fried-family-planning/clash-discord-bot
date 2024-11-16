import type {CommandSpec, IxDS, snflk} from '#src/discord/types.ts';
import {CSL, E} from '#src/internal/pure/effect.ts';
import type {IxD} from '#src/discord/util/discord.ts';
import {getDiscordClan, putDiscordClan} from '#src/dynamo/discord-clan.ts';
import {getAliasTag} from '#src/clash/get-alias-tag.ts';
import {OPTION_CLAN} from '#src/discord/ix-constants.ts';
import {validateServer} from '#src/discord/util/validation.ts';
import {SlashUserError} from '#src/internal/errors.ts';


export const CACHE_BUST
    = {
        type       : 1,
        name       : 'bust',
        description: 'devs & inner circle ONLY!!!',
        options    : {
            ...OPTION_CLAN,
        },
    } as const satisfies CommandSpec;


/**
 * @desc [SLASH /bust]
 */
export const cacheBust = (data: IxD, options: IxDS<typeof CACHE_BUST>) => E.gen(function * () {
    const [server, user] = yield * validateServer(data);

    if (!user.roles.includes(server.admin as snflk)) {
        return yield * new SlashUserError({issue: 'inner circle ONLY!!!'});
    }


    const clanTag = getAliasTag(options.clan);

    yield * CSL.debug(clanTag);

    const clan = yield * getDiscordClan({pk: data.guild_id!, sk: clanTag});

    yield * putDiscordClan({
        ...clan,
        prep_opponent  : '',
        battle_opponent: '',
    });

    return {
        embeds: [{description: 'cache bussin dun cache busted'}],
    };
});
