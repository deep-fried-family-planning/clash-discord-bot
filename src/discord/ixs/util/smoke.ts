import type {CommandSpec, IxDS, snflk} from '#src/discord/types.ts';
import {CSL, E} from '#src/internal/pure/effect.ts';
import {IXCBS, type IxD} from '#src/discord/util/discord.ts';
import {getAliasTag} from '#src/clash/get-alias-tag.ts';
import {UI} from 'dfx';
import {OPTION_CLAN} from '#src/discord/ix-constants.ts';
import {validateServer} from '#src/discord/util/validation.ts';
import {SlashUserError} from '#src/internal/errors.ts';


export const SMOKE
    = {
        type       : 1,
        name       : 'smoke',
        description: 'devs & inner circle ONLY!!!',
        options    : {
            ...OPTION_CLAN,
        },
    } as const satisfies CommandSpec;


/**
 * @desc [SLASH /smoke]
 */
export const smoke = (data: IxD, options: IxDS<typeof SMOKE>) => E.gen(function * () {
    const [server, user] = yield * validateServer(data);

    if (!user.roles.includes(server.admin as snflk)) {
        return yield * new SlashUserError({issue: 'inner circle ONLY!!!'});
    }

    const clanTag = getAliasTag(options.clan);

    yield * CSL.debug(clanTag);

    // const clan = yield * getDiscordClan({pk: data.guild_id!, sk: clanTag});

    return {
        embeds    : [{description: 'smoke test info board'}],
        components: UI.grid([
            [UI.button({
                style    : IXCBS.SUCCESS,
                label    : 'Start',
                custom_id: `/k/ENTRY/t/INFO`,
            })],
        ]),
    };
});
