import {OPTION_CLAN} from '#src/constants/ix-constants.ts';
import type {CommandSpec, IxDS, snflk} from '#src/internal/discord-old/types.ts';
import {validateServer} from '#src/internal/discord-old/util/validation.ts';
import type {IxD} from '#src/internal/discord.ts';
import {SlashUserError} from '#src/internal/errors.ts';
import {E} from '#src/internal/pure/effect.ts';



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
        name: 'DeepFryer Omni Board',
      },
      title      : 'Deep Fried Family Planning',
      description: 'The one board to rule them all',
      footer     : {
        text: 'DeepFryer is made with ❤️ by DFFP.',
      },
    }],
  };
});
