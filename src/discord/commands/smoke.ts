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
  // const [server, user] = yield * validateServer(data);
  //
  // if (!user.roles.includes(server.admin as snflk)) {
  //   return yield * new SlashUserError({issue: 'inner circle ONLY!!!'});
  // }
  //
  // return {
  //   embeds: [{
  //     author: {
  //       name: 'DeepFryer Omni Board',
  //     },
  //     title      : 'Deep Fried Family Planning',
  //     description: 'The one board to rule them all',
  //     footer     : {
  //       text: 'DeepFryer is made with ❤️ by DFFP.',
  //     },
  //   }],
  // };

  // return (yield * synthesize(OmniPublic)) as unknown as Message;

  return yield* DisReact.createRoot(OmniBoard);
});
