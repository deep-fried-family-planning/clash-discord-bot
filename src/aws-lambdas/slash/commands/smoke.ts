import {ApplicationCommandType} from '@discordjs/core/http-only';
import type {CommandSpec, Interaction} from '#src/discord/types.ts';
import type {CmdOps} from '#src/aws-lambdas/slash/types.ts';
import {E} from '#src/internals/re-exports/effect.ts';

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
export const smoke = (data: Interaction, options: CmdOps<typeof SMOKE>) => E.gen(function * () {
    return {
        embeds: [{description: 'ya did the thing'}],
    };
});
