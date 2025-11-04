import type {CreateScheduleCommandInput} from '@aws-sdk/client-scheduler';
import {SchedulerService} from '@effect-aws/client-scheduler';
import {devServer} from '../../cli/dev-server.ts';
import * as E from 'effect/Effect';

export class TaskScheduler extends E.Service<TaskScheduler>()('deepfryer/TaskScheduler', {
  effect: E.gen(function* () {
    const scheduler = yield* SchedulerService;

    return {
      createSchedule: (data: CreateScheduleCommandInput) =>
        E.asVoid(
          scheduler.createSchedule(data),
        ),
    };
  }),
  dependencies: [
    SchedulerService.defaultLayer,
  ],
  accessors: true,
}) {}

class LocalTaskScheduler extends E.Service<TaskScheduler>()('deepfryer/TaskScheduler', {
  succeed: {
    createSchedule: (data) =>
      E.asVoid(
        E.promise(async () => await devServer('task', {
          Records: [{
            body: data.Target?.Input,
          }],
        })),
      ),
  } as Omit<TaskScheduler, '_tag'>,
  accessors: true,
}) {}

export const TaskSchedulerLive
  = process.env.LAMBDA_LOCAL === 'true' ? LocalTaskScheduler.Default
  : TaskScheduler.Default;
