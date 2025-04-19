import {OPTION_CLAN} from '#src/constants/ix-constants.ts';
import {OmniPublic} from '#src/discord/omni-board/omni-public.tsx';
import {synthesize} from '#src/disreact/runtime/old/synthesize.ts';
import type {CommandSpec, IxDS} from '#src/internal/discord-old/types.ts';
import type {IxD} from '#src/internal/discord.ts';
import {E} from '#src/internal/pure/effect.ts';
import type {Message} from 'dfx/types';



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
export const smoke = (data: IxD, options: IxDS<typeof SMOKE>) => E.gen(function* () {
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

  return (yield * synthesize(OmniPublic)) as unknown as Message;
});
