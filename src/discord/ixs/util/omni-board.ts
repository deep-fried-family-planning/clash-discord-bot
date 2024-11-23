import type {CommandSpec, IxDS, snflk} from '#src/discord/types.ts';
import {E} from '#src/internal/pure/effect.ts';
import {IXCBS, type IxD} from '#src/discord/util/discord.ts';
import {UI} from 'dfx';
import {validateServer} from '#src/discord/util/validation.ts';
import {SlashUserError} from '#src/internal/errors.ts';


export const OMNI_BOARD
    = {
        type       : 1,
        name       : 'omni-board',
        description: '[ADMIN]: create an omni board in the current channel',
        options    : {},
    } as const satisfies CommandSpec;


/**
 * @desc [SLASH /omni-board]
 */
export const omniBoard = (data: IxD, options: IxDS<typeof OMNI_BOARD>) => E.gen(function * () {
    const [server, user] = yield * validateServer(data);

    if (!user.roles.includes(server.admin as snflk)) {
        return yield * new SlashUserError({issue: 'inner circle ONLY!!!'});
    }

    return {
        embeds: [{
            author: {
                name: 'Omni Board',
            },
            title      : 'Deep Fried Family Planning',
            description: 'The one board to rule them all',
            footer     : {
                text: 'DeepFryer is made with ❤️ by DFFP.',
            },
        }],
        components: UI.grid([
            [UI.button({
                style    : IXCBS.SUCCESS,
                label    : 'Start',
                custom_id: `/k/ENTRY/t/INFO`,
            })],
        ]),
    };
});
