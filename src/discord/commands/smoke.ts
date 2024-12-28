import {exampleDriver, exampleView} from '#discord/example.ts';
import {CxPath} from '#discord/routing/cx-path.ts';
import {OPTION_CLAN} from '#src/constants/ix-constants.ts';
import type {CommandSpec, IxDS, snflk} from '#src/discord/types.ts';
import {validateServer} from '#src/discord/util/validation.ts';
import type {IxD} from '#src/internal/discord.ts';
import {Const} from '#src/internal/discord/index';
import {SlashUserError} from '#src/internal/errors.ts';
import {E} from '#src/internal/pure/effect.ts';
import {UI} from 'dfx';


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
export const smoke = (data: IxD, _: IxDS<typeof SMOKE>) => E.gen(function * () {
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
        custom_id: CxPath.build({
          ...CxPath.empty(),
          root: exampleDriver.name,
          view: exampleView.name,
          mod : Const.ENTRY,
        }),
      })],
    ]),
  };
});
