import type {CommandSpec, IxDS} from '#src/discord/types.ts';
import {E} from '#src/internal/pure/effect.ts';
import type {IxD} from '#src/discord/util/discord.ts';
import {getDiscordClan} from '#src/dynamo/discord-clan.ts';
import {getAliasTag} from '#src/clash/get-alias-tag.ts';
import {UI} from 'dfx';
import {EntryLinks} from '#src/discord/ixc/links/links.ts';
import {OPTION_CLAN} from '#src/discord/ix-constants.ts';
import {validateServer} from '#src/discord/util/validation.ts';


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
    yield * validateServer(data);

    const clanTag = getAliasTag(options.clan);

    const clan = yield * getDiscordClan({pk: data.guild_id!, sk: clanTag});

    return {
        embeds    : [{description: 'ya did the thing'}],
        components: UI.grid([
            [EntryLinks.built],
        ]),
    };
});
