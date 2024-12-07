import dayjs from 'dayjs';
import daytimezone from 'dayjs/plugin/timezone';
import dayutc from 'dayjs/plugin/utc';
import {dTable} from '#src/discord/util/message-table.ts';
import {E, pipe} from '#src/internal/pure/effect.ts';
import {dCodes, dLines, dtRel} from '#src/discord/util/markdown.ts';
import {COLOR, nColor} from '#src/constants/colors.ts';
import type {CommandSpec, IxDS} from '#src/discord/types.ts';
import type {IxD} from '#src/internal/discord.ts';

import {validateServer} from '#src/discord/util/validation.ts';
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
        yield * DateTime.nowInCurrentZone,
        DateTime.addDuration(`${ops.hours_ahead} hour`),
        DateTime.formatIso,
        (iso) => iso.replace(/\..+Z/, ''),
    );
    yield * Scheduler.createSchedule({
        Name: `remind-me-user${ix.member!.user!.id}-${time}`,

        ScheduleExpression        : `at(${time})`,
        FlexibleTimeWindow        : {Mode: 'OFF'},
        ScheduleExpressionTimezone: 'America/New_York',

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