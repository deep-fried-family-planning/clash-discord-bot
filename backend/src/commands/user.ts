import {Registry} from '#src/data/index.ts';
import {COLOR, nColor} from '#src/internal/old/colors.ts';
import {OPTION_TZ} from '#src/internal/old/ix-constants.ts';
import type {CommandSpec, IxDS} from '#src/internal/old/types.ts';
import type {Discord} from 'dfx';
import * as E from 'effect/Effect';
import * as S from 'effect/Schema';

export const USER = {
  type       : 1,
  name       : 'user',
  description: 'update user settings',
  options    : {
    tz: {
      ...OPTION_TZ.tz,
      required: true,
    },
    discord_user: {
      type       : 6,
      name       : 'discord_user',
      description: '[admin_role] discord user to update',
    },
  },
} as const satisfies CommandSpec;

/**
 * @desc [SLASH /user]
 */
export const user = (data: Discord.APIInteraction, options: IxDS<typeof USER>) => E.gen(function* () {
  const timezone = yield* S.decodeUnknown(S.TimeZone)(options.tz);

  const registration = yield* Registry.registerUser({
    caller_id: data.member!.user.id,
    target_id: options.discord_user,
    payload  : {
      timezone,
    },
  });

  return {
    embeds: [{
      color      : nColor(COLOR.SUCCESS),
      description: registration.description,
    }],
  };
});
