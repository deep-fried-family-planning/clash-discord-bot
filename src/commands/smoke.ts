import {OPTION_CLAN} from '#src/discord/old/ix-constants.ts';
import type {CommandSpec, IxDS} from '#src/discord/old/types.ts';
import {OmniBoard} from '#src/discord/omni-board/omni-board.tsx';
import {DisReact} from '#src/disreact/DisReact.ts';
import type {Discord} from 'dfx';
import * as E from 'effect/Effect';

export const SMOKE = {
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
export const smoke = (data: Discord.APIInteraction, options: IxDS<typeof SMOKE>) => E.gen(function* () {
  return yield* DisReact.createRoot(OmniBoard);
});
