import {UserRegistry} from '#src/data';
import {COLOR, nColor} from '#src/internal/discord-old/constants/colors.ts';
import {OPTION_TZ} from '#src/internal/discord-old/constants/ix-constants.ts';
import type {IxD} from '#src/internal/discord-old/discord.ts';
import type {CommandSpec, IxDS} from '#src/internal/discord-old/types.ts';
import {E, S} from '#src/internal/pure/effect.ts';

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
export const user = (data: IxD, options: IxDS<typeof USER>) => E.gen(function* () {
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
