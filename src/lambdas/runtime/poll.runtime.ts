import {DiscordRESTEnv} from 'config/external.ts';
import {DeepFryerPage} from '#src/database/service/DeepFryerPage.ts';
import {L, pipe} from '#src/internal/pure/effect.ts';
import {poll} from '#src/lambdas/poll.ts';
import {DeepFryerLogger} from '#src/service/DeepFryerLogger.ts';
import {EventRouterLive} from '#src/service/EventRouter.ts';
import {TaskSchedulerLive} from '#src/service/TaskScheduler.ts';
import {BasicLayer, ClashLayer, DatabaseLayer, NetworkLayer} from '#src/util/layers.ts';
import {Scheduler} from '@effect-aws/client-scheduler';
import {SQS} from '@effect-aws/client-sqs';
import {LambdaHandler} from '@effect-aws/lambda';
import {NodeHttpClient} from '@effect/platform-node';
import {DiscordConfig, DiscordRESTMemoryLive} from 'dfx';

const layer = pipe(
  L.mergeAll(
    ClashLayer,
    Scheduler.defaultLayer,
    SQS.defaultLayer,
    EventRouterLive(),
    TaskSchedulerLive,
    DeepFryerPage.Default,
  ),
  L.provideMerge(DeepFryerLogger.Default.pipe(
    L.provideMerge(DiscordRESTMemoryLive),
    L.provideMerge(NodeHttpClient.layerUndici),
    L.provideMerge(DiscordConfig.layerConfig(DiscordRESTEnv)),
  )),
  L.provideMerge(DatabaseLayer),
  L.provideMerge(NetworkLayer),
  L.provideMerge(BasicLayer),
);

export const handler = LambdaHandler.make({
  handler: poll,
  layer  : layer,
});
