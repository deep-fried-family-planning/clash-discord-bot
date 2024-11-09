import {ApplicationCommandType} from '@discordjs/core/http-only';
import type {CommandSpec} from '#src/aws-lambdas/menu/old/types.ts';
import type {CmdOps} from '#src/aws-lambdas/slash/types.ts';
import {E} from '#src/internals/re-exports/effect.ts';
import type {CmdIx} from '#src/internals/re-exports/discordjs.ts';
import {validateServer} from '#src/aws-lambdas/slash/utils.ts';

export const SMOKE
    = {
        type       : ApplicationCommandType.ChatInput,
        name       : 'smoke',
        description: 'devs & inner circle ONLY!!!',
        options    : {

        },
    } as const satisfies CommandSpec;

/**
 * @desc [SLASH /smoke]
 */
export const smoke = (data: CmdIx, options: CmdOps<typeof SMOKE>) => E.gen(function * () {
    yield * validateServer(data);

    return {
        embeds: [{description: 'ya did the thing'}],
    };
});
