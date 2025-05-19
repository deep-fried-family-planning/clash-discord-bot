import {COLOR, nColor} from '#src/discord/old/colors.ts';
import {dtRel} from '#src/discord/old/markdown.ts';
import type {CommandSpec, IxDS} from '#src/discord/old/types.ts';
import {validateServer} from '#src/discord/old/validation.ts';
import {Scheduler} from '@effect-aws/client-scheduler';
import type {Discord} from 'dfx';
import * as DateTime from 'effect/DateTime';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';

export const REMINDME = {
  type       : 1,
  name       : 'remind_me',
  description: 'do your hits or something',
  options    : {
    hours_ahead: {
      name       : 'hours_ahead',
      description: 'number of hours ahead to offset',
      type       : 4,
      min_value  : 0,
      required   : true,
    },
    message_url: {
      name       : 'message_url',
      description: 'stores message url',
      type       : 3,
      required   : true,
    },
  },
} as const satisfies CommandSpec;

/**
 * @desc [SLASH /remind-me]
 */
export const remind_me = (ix: Discord.APIInteraction, ops: IxDS<typeof REMINDME>) => E.gen(function* () {
  yield* validateServer(ix);

  const time = pipe(
    new Date(Date.now()),
    DateTime.unsafeMake,
    DateTime.addDuration(`${ops.hours_ahead as number} hour`),
    DateTime.formatIso,
    (iso) => iso.replace(/\..+Z/, ''),
  );

  yield* Scheduler.createSchedule({
    Name: `remind-me-user${ix.member!.user!.id}-${Date.now()}`,

    ScheduleExpression        : `at(${time})`,
    FlexibleTimeWindow        : {Mode: 'OFF'},
    ScheduleExpressionTimezone: 'Etc/Zulu',

    Target: {
      Arn    : process.env.SQS_ARN_SCHEDULED_TASK,
      RoleArn: process.env.LAMBDA_ROLE_ARN,
      Input  : JSON.stringify({
        message_url: ops.message_url,
        user_id    : ix.member!.user!.id,
        type       : 'remind me',
        channel_id : ix.channel_id,
      }),
    },
    ActionAfterCompletion: 'DELETE',
  });

  const user_time = pipe(
    yield* DateTime.nowInCurrentZone,
    DateTime.addDuration(`${ops.hours_ahead as number} hour`),
    DateTime.toEpochMillis,
  );
  return {
    embeds: [{
      color      : nColor(COLOR.ORIGINAL),
      description: pipe(`Reminder created: ${dtRel(user_time)}`),
    }],
  };
});
