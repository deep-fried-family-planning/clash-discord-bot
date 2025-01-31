import {COLOR, nColor} from '#src/constants/colors.ts';
import type {CommandSpec, snflk} from '#src/internal/discord-old/types.ts';
import {dLinesS} from '#src/internal/discord-old/util/markdown.ts';
import {validateServer} from '#src/internal/discord-old/util/validation.ts';
import {IXCBS, type IxD} from '#src/internal/discord.ts';
import {SlashUserError} from '#src/internal/errors.ts';
import {E} from '#src/internal/pure/effect.ts';
import {UI} from 'dfx';



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
