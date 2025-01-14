import {OPTION_CLAN} from '#src/constants/ix-constants.ts';
import {IxRoot} from '#src/discord/ix-root.ts';
import type {CommandSpec, IxDS, snow} from '#src/discord/types.ts';
import {validateServer} from '#src/discord/util/validation.ts';
import type {IxD} from '#src/internal/discord.ts';
import {Starter} from '#src/internal/disreact/initializer.ts';
import {SlashUserError} from '#src/internal/errors.ts';
import {E} from '#src/internal/pure/effect.ts';


export const SMOKE = {
  type       : 1,
  name       : 'smoke',
  description: 'devs & inner circle ONLY!!!',
  options    : {
    ...OPTION_CLAN,
  },
} as const satisfies CommandSpec;


/**
 * @desc [SLASH
 *   /smoke]
 */
export const smoke = (data: IxD, _: IxDS<typeof SMOKE>) => E.gen(function * () {
  const [server, user] = yield * validateServer(data);

  if (!user.roles.includes(server.admin as snow)) {
    return yield * new SlashUserError({issue: 'inner circle ONLY!!!'});
  }

  // return {
  //   embeds: [{
  //     author: {
  //       name: 'Dev Omni',
  //     },
  //     title      : 'Dev',
  //     description: 'The one board to rule them all',
  //     image      : {
  //       url: new URL(`${DFFP_URL}${pipe(
  //         Route.Simulated.empty(),
  //         Route.setRoot('Starter'),
  //         Route.encodeUrl,
  //       )}`),
  //     },
  //   }],
  //   components: UI.grid([
  //     [UI.button({
  //       label    : 'Dev Mode',
  //       custom_id: pipe(
  //         Route.Component.empty(),
  //         Route.setRow('0'),
  //         Route.setCol('0'),
  //         Route.encode,
  //       ),
  //     }), UI.button({
  //       label    : 'V2 Omni Board Test',
  //       custom_id: pipe(
  //         Route.Component.empty(),
  //         Route.setRow('0'),
  //         Route.setCol('1'),
  //         Route.encode,
  //       ),
  //     })],
  //   ]),
  // };

  return yield * IxRoot.synthesize({Starter});
});
