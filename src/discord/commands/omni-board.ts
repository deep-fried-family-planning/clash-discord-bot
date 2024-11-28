import type {CommandSpec, snflk} from '#src/discord/types.ts';
import {E} from '#src/internal/pure/effect.ts';
import {IXCBS, type IxD} from '#src/internal/discord.ts';
import {UI} from 'dfx';
import {validateServer} from '#src/discord/util/validation.ts';
import {SlashUserError} from '#src/internal/errors.ts';
import {COLOR, nColor} from '#src/constants/colors.ts';
import {dLinesS} from '#src/discord/util/markdown.ts';


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
export const omniBoard = (data: IxD) => E.gen(function * () {
    const [server, user] = yield * validateServer(data);

    if (!user.roles.includes(server.admin as snflk)) {
        return yield * new SlashUserError({issue: 'inner circle ONLY!!!'});
    }

    return {
        embeds: [{
            color : nColor(COLOR.ORIGINAL),
            author: {
                name: 'DeepFryer Omni Board',
            },
            title      : 'Deep Fried Family Planning',
            description: dLinesS(
                'The one board to rule them all...',
                '',
                'Click "Start" to:',
                '* Configure user settings',
                '* Link Clash accounts or clans',
                '* Signup for war or CWL rosters',
                '* View DFFP info, rules, and more',
            ),
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
