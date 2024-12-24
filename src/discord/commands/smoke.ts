import type {CommandSpec, IxDS, snflk} from '#src/discord/types.ts';
import {E} from '#src/internal/pure/effect.ts';
import type {IxD} from '#src/internal/discord.ts';
import {OPTION_CLAN} from '#src/constants/ix-constants.ts';
import {validateServer} from '#src/discord/util/validation.ts';
import {SlashUserError} from '#src/internal/errors.ts';
import {UI} from 'dfx';
import {RK_ENTRY} from '#src/constants/route-kind.ts';
import {v3_routing, v3_slice, v3_view1} from '#src/discord/v3/v3.ts';
import {defaultCxRouter} from '#src/internal/ix-v3/routing';


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

    return {
        embeds: [{
            author: {
                name: 'Dev Omni',
            },
            title      : 'Dev',
            description: 'The one board to rule them all',
        }],
        components: UI.grid([
            [UI.button({
                label    : 'Dev Mode',
                custom_id: defaultCxRouter.build({
                    root  : 'v3',
                    name  : 'vdomtest',
                    data  : 'test1',
                    action: 'init',
                    type  : 'test',
                    mode  : 'test',
                    row   : 'test',
                    col   : 'test',
                    pgp   : 'test',
                    pgn   : 'test',
                    pgx   : 'test',
                    view  : 'root',
                    mod   : RK_ENTRY,
                }),
            })],
        ]),
    };
});
