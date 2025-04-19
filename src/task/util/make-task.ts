

import {DT, type E, g, pipe, S} from '#src/internal/pure/effect.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import {Scheduler} from '@effect-aws/client-scheduler';
import type {DurationInput} from 'effect/Duration';



export type TaskEffect = E.Effect<void, any, any>;
export type TaskSchema = S.Schema<any, any>;


export const TEMP_TEMP_ROLES = {
  warmanager : '1269057897577578577',
  staff      : '1266214350339969127',
  colead     : '1208867535131381840',
  coleadtrial: '1269059230955077674',
  donator    : '1254791225022615623',
};


export const makeTask = <
  Eval extends TaskEffect,
  Id extends S.Literal<readonly [str]>,
  Schema extends S.Schema<any, any>,
>(
  id: Id,
  dataSchema: Schema,
  evaluator: (data: Schema['Type']) => Eval,
) => {
  const encode = S.encodeUnknownSync(dataSchema);
  const decode = S.decodeUnknownSync(dataSchema);

  return {
    id: id.literals[0],

    send: (
      schedule: {
        group: str;
        name : str;
        start: Date;
        after: DurationInput;
        data : Schema['Type'];
      },
    ) => g(function* () {
      const encoded = encode(schedule.data);

      const maybeTime = pipe(
        schedule.start,
        DT.unsafeMake,
        DT.addDuration(schedule.after),
      );

      const resolvedTime = (yield * DT.isFuture(maybeTime))
        ? maybeTime
        : pipe(
          new Date(Date.now()),
          DT.unsafeMake,
          DT.addDuration('1 minute'),
        );

      const time = pipe(
        resolvedTime,
        DT.formatIso,
        (iso) => iso.replace(/\..+Z/, ''),
      );

      yield * Scheduler.createSchedule({
        GroupName                 : schedule.group,
        Name                      : schedule.name,
        ScheduleExpression        : `at(${time})`,
        FlexibleTimeWindow        : {Mode: 'OFF'},
        ScheduleExpressionTimezone: 'Etc/Zulu',
        Target                    : {
          Arn    : process.env.SQS_ARN_SCHEDULED_TASK,
          RoleArn: process.env.LAMBDA_ROLE_ARN,
          Input  : JSON.stringify({
            id: id.literals[0],

            data: encoded,
          }),
        },
        ActionAfterCompletion: 'DELETE',
      });
    }),

    evaluator: (data: unknown) => g(function* () {
      const decoded = decode(data);

      return yield * evaluator(decoded);
    }),
  };
};
