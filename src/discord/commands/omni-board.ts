import {COLOR, nColor} from '#src/discord/old/colors.ts';
import type {CommandSpec} from '#src/discord/old/types.ts';
import * as E from 'effect/Effect';
import type {Discord} from 'dfx';

export const OMNI_BOARD = {
  type       : 1,
  name       : 'omni-board',
  description: '[ADMIN]: create an omni board in the current channel',
  options    : {},
} as const satisfies CommandSpec;

/**
 * @desc [SLASH /omni-board]
 */
export const omniBoard = (data: Discord.APIInteraction) => E.gen(function* () {
  // return yield * DisReactDOM.synthesize(OmniPublic);

  return {
    embeds: [{description: '', color: nColor(COLOR.ORIGINAL)}],
  };
});
