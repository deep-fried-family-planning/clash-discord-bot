import {User} from '#src/database/arch/codec';
import {readItem, saveItem} from '#src/database/DeepFryerDB.ts';
import {COLOR, nColor} from '#src/constants/colors.ts';
import {OPTION_TZ} from '#src/constants/ix-constants.ts';
import type {IxD} from '#src/internal/discord.ts';
import type {CommandSpec, IxDS, snflk} from '#src/discord/types.ts';
import {validateServer} from '#src/internal/validation.ts';
import {SlashUserError} from '#src/internal/errors.ts';
import {DateTime} from 'effect';
import * as E from 'effect/Effect';

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
  if (!data.member) {
    return yield* new SlashUserError({issue: 'Contextual authentication failed.'});
  }

  if (Boolean(options.quiet_hours_start) !== Boolean(options.quiet_hours_end)) {
    return yield* new SlashUserError({issue: 'must have both quiet hours start/end defined'});
  }

  const userId = options.discord_user ?? data.member.user!.id;

  if (options.discord_user) {
    const [server] = yield* validateServer(data);

    if (!data.member.roles.includes(server.admin as snflk)) {
      return yield* new SlashUserError({issue: 'admin role required'});
    }
  }

  const user = yield* readItem(User, userId, 'now').pipe(
    E.catchTag('NoSuchElementException', () => E.succeed(undefined)),
  );

  if (!user) {
    yield* saveItem(User, {
      _tag           : 'User',
      pk             : userId,
      sk             : 'now',
      version        : 0,
      created        : undefined,
      updated        : undefined,
      gsi_all_user_id: userId,
      timezone       : DateTime.zoneUnsafeMakeNamed(options.tz),
    });

    return {
      embeds: [{
        color      : nColor(COLOR.SUCCESS),
        description: `<@${userId}> new user registration successful (${options.tz})`,
      }],
    };
  }

  yield* saveItem(User, {
    ...user,
    timezone: DateTime.zoneUnsafeMakeNamed(options.tz),
  });

  return {
    embeds: [{
      color      : nColor(COLOR.SUCCESS),
      description: `<@${userId}> user registration updated (${options.tz})`,
    }],
  };
});
