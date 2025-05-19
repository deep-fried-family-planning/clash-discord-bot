import {UserRegistry} from '#src/data';
import {COLOR, nColor} from '#src/discord/old/colors.ts';
import {OPTION_TZ} from '#src/discord/old/ix-constants.ts';
import type {CommandSpec, IxDS} from '#src/discord/old/types.ts';
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
    quiet_hours_start: {
      type       : 3,
      name       : 'quiet_hours_start',
      description: 'hours not to be pinged',
      choices    : Array(24).fill(0).map((_, idx) => ({
        name : `${idx.toString().padStart(2, '0')}:00`,
        value: `${idx.toString().padStart(2, '0')}:00`,
      })),
    },
    quiet_hours_end: {
      type       : 3,
      name       : 'quiet_hours_end',
      description: 'hours not to be pinged',
      choices    : Array(24).fill(0).map((_, idx) => ({
        name : `${idx.toString().padStart(2, '0')}:00`,
        value: `${idx.toString().padStart(2, '0')}:00`,
      })),
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

  const registration = yield* UserRegistry.register({
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
