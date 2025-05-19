import {poll} from '#src/lambdas/poll.ts';
import {ClashKing} from '#src/service/ClashKing.ts';
import {ClashOfClans} from '#src/service/ClashOfClans.ts';
import {DataClient} from '#src/service/DataClient.ts';
import {DeepFryerLogger} from '#src/service/DeepFryerLogger.ts';
import {EventRouterLive} from '#src/service/EventRouter.ts';
import {TaskSchedulerLive} from '#src/service/TaskScheduler.ts';
import {BasicLayer, NetworkLayer} from '#src/util/layers.ts';
import {Scheduler} from '@effect-aws/client-scheduler';
import {SQS} from '@effect-aws/client-sqs';
import {LambdaHandler} from '@effect-aws/lambda';
import {NodeHttpClient} from '@effect/platform-node';
import {DiscordRESTEnv} from 'config/external.ts';
import {DiscordConfig, DiscordRESTMemoryLive} from 'dfx';
import {pipe} from 'effect/Function';
import * as L from 'effect/Layer';

const layer = pipe(
  L.mergeAll(
    ClashOfClans.Default,
    ClashKing.Default,
    Scheduler.defaultLayer,
    SQS.defaultLayer,
    EventRouterLive(),
    TaskSchedulerLive,
    DataClient.Default,
  ),
  L.provideMerge(DeepFryerLogger.Default.pipe(
    L.provideMerge(DiscordRESTMemoryLive),
    L.provideMerge(NodeHttpClient.layerUndici),
    L.provideMerge(DiscordConfig.layerConfig(DiscordRESTEnv)),
  )),
  L.provideMerge(NetworkLayer),
  L.provideMerge(BasicLayer),
);

export const handler = LambdaHandler.make({
  handler: poll,
  layer  : layer,
});
