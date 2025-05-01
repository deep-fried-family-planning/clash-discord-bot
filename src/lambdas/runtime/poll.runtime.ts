import {DeepFryerPage} from '#src/database/service/DeepFryerPage.ts';
import {L, pipe} from '#src/internal/pure/effect.ts';
import {poll} from '#src/lambdas/poll.ts';
import {EventRouterLive} from '#src/service/EventRouter.ts';
import {TaskSchedulerLive} from '#src/service/TaskScheduler.ts';
import {BasicLayer, ClashLayer, DatabaseLayer, DiscordLayer, NetworkLayer} from '#src/util/layers.ts';
import {Scheduler} from '@effect-aws/client-scheduler';
import {SQS} from '@effect-aws/client-sqs';
import {LambdaHandler} from '@effect-aws/lambda';

const layer = pipe(
  L.mergeAll(
    ClashLayer,
    Scheduler.defaultLayer,
    SQS.defaultLayer,
    EventRouterLive,
    TaskSchedulerLive,
    DeepFryerPage.Default,
  ),
  L.provideMerge(DiscordLayer),
  L.provideMerge(DatabaseLayer),
  L.provideMerge(NetworkLayer),
  L.provideMerge(BasicLayer),
);

export const handler = LambdaHandler.make({
  handler: poll,
  layer  : layer,
});
