import type {CreateScheduleCommandInput} from '@aws-sdk/client-scheduler';
import {SchedulerService} from '@effect-aws/client-scheduler';
import {Effect} from 'effect';
import {devServer} from '#dev/dev-server.ts';

export class TaskScheduler extends Effect.Service<TaskScheduler>()('deepfryer/TaskScheduler', {
  effect: Effect.gen(function* () {
    const scheduler = yield* SchedulerService;

    return {
      createSchedule: (data: CreateScheduleCommandInput) =>
        Effect.asVoid(
          scheduler.createSchedule(data),
        ),
    };
  }),
  dependencies: [
    SchedulerService.defaultLayer,
  ],
  accessors: true,
}) {}

class LocalTaskScheduler extends Effect.Service<TaskScheduler>()('deepfryer/TaskScheduler', {
  succeed: {
    createSchedule: (data) =>
      Effect.asVoid(
        Effect.promise(async () => await devServer('task', {
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
