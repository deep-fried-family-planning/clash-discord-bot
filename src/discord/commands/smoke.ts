import type {CommandSpec, IxDS, snflk} from '#src/discord/types.ts';
import {E} from '#src/internal/pure/effect.ts';
import type {IxD} from '#src/internal/discord.ts';
import {OPTION_CLAN} from '#src/constants/ix-constants.ts';
import {validateServer} from '#src/discord/util/validation.ts';
import {SlashUserError} from '#src/internal/errors.ts';
import {UI} from 'dfx';
import {CxId} from '#src/ix/id/cx-id.ts';
import {RK_ENTRY} from '#src/constants/route-kind.ts';


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
                custom_id: CxId.build({
                    origin   : 'test',
                    slice    : 'test',
                    action   : 'test',
                    ctype    : 'test',
                    cmode    : 'test',
                    row      : 'test',
                    col      : 'test',
                    view     : 'test',
                    modifiers: RK_ENTRY,
                }),
            })],
        ]),
    };
});
