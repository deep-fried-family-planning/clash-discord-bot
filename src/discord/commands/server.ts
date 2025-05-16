import {ServerRegistry} from '#src/data';
import {COLOR, nColor} from '#src/internal/discord-old/constants/colors.ts';
import {OPTION_TZ} from '#src/internal/discord-old/constants/ix-constants.ts';
import type {IxD} from '#src/internal/discord-old/discord.ts';
import type {CommandSpec, IxDS} from '#src/internal/discord-old/types.ts';
import {E} from '#src/internal/pure/effect.ts';

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
export const server = (data: IxD, options: IxDS<typeof SERVER>) => E.gen(function* () {
  const registration = yield* ServerRegistry.register({
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
