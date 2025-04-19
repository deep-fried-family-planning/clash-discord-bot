import type {CommandSpec} from '#src/internal/discord-old/types.ts';
import type {IxD} from '#src/internal/discord.ts';
import {E} from '#src/internal/pure/effect.ts';



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
export const omniBoard = (data: IxD) => E.gen(function* () {
  // return yield * DisReactDOM.synthesize(OmniPublic);
});
