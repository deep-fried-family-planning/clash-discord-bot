import {Registry} from '#src/data/index.ts';
import {COLOR, nColor} from '#src/discord/old/colors.ts';
import {OPTION_TZ} from '#src/discord/old/ix-constants.ts';
import type {CommandSpec, IxDS} from '#src/discord/old/types.ts';
import type {Discord} from 'dfx';
import * as E from 'effect/Effect';

export const SERVER = {
  type       : 1,
  name       : 'server',
  description: 'link discord server to deepfryer',
  options    : {
    admin: {
      type       : 8,
      name       : 'admin',
      description: 'oomgaboomga',
      required   : true,
    },
    forum: {
      type       : 7,
      name       : 'forum',
      description: 'oomgaboomga',
      required   : true,
    },
    tz: {
      ...OPTION_TZ.tz,
    },
  },
} as const satisfies CommandSpec;

/**
 * @desc [SLASH /server]
 */
export const server = (data: Discord.APIInteraction, options: IxDS<typeof SERVER>) => E.gen(function* () {
  const registration = yield* Registry.registerServer({
    caller_id   : data.member!.user.id,
    caller_roles: data.member!.roles,
    guild_id    : data.guild_id!,
    payload     : {
      admin: options.admin,
    },
  });

  return {
    embeds: [{
      color      : nColor(COLOR.SUCCESS),
      description: registration.description,
    }],
  };
});
