import {COLOR, nColor} from '#src/constants/colors.ts';
import type {CommandSpec, IxDS} from '#src/internal/discord-old/types.ts';
import {dtRel} from '#src/internal/discord-old/util/markdown.ts';

import {validateServer} from '#src/internal/discord-old/util/validation.ts';
import type {IxD} from '#src/internal/discord.ts';
import {DT, E, pipe} from '#src/internal/pure/effect.ts';
import {Scheduler} from '@effect-aws/client-scheduler';
import * as DateTime from 'effect/DateTime';



export const REMINDME
               = {
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
export const remind_me = (ix: IxD, ops: IxDS<typeof REMINDME>) => E.gen(function * () {
  yield * validateServer(ix);

  const time = pipe(
    new Date(Date.now()),
    DT.unsafeMake,
    DT.addDuration(`${ops.hours_ahead} hour`),
    DT.formatIso,
    (iso) => iso.replace(/\..+Z/, ''),
  );
  yield * Scheduler.createSchedule({
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
    yield * DateTime.nowInCurrentZone,
    DateTime.addDuration(`${ops.hours_ahead} hour`),
    DateTime.toEpochMillis,
  );
  return {
    embeds: [{
      color      : nColor(COLOR.ORIGINAL),
      description: pipe(`Reminder created at ${dtRel(user_time)}`),
    }],
  };
});
