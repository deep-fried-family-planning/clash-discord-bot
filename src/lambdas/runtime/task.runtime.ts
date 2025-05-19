import {task} from '#src/lambdas/task.ts';
import {BaseLambdaLayer} from '#src/lambdas/util.ts';
import {ClashOfClans} from '#src/service/ClashOfClans.ts';
import {DeepFryerLogger} from '#src/service/DeepFryerLogger.ts';
import {EventRouterLive} from '#src/service/EventRouter.ts';
import {LambdaHandler} from '@effect-aws/lambda';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import {NodeHttpClient} from '@effect/platform-node';
import {DiscordRESTEnv} from 'config/external.ts';
import {DiscordConfig, DiscordRESTMemoryLive} from 'dfx';
import {pipe} from 'effect/Function';
import * as L from 'effect/Layer';

const layer = pipe(
  L.mergeAll(
    EventRouterLive(),
    ClashOfClans.Default,
    DeepFryerLogger.Default.pipe(
      L.provideMerge(DiscordRESTMemoryLive),
      L.provideMerge(NodeHttpClient.layerUndici),
      L.provideMerge(DiscordConfig.layerConfig(DiscordRESTEnv)),
    ),
  ),
  L.provideMerge(DynamoDBDocument.defaultLayer),
  L.provideMerge(BaseLambdaLayer),
);

export const handler = LambdaHandler.make({
  handler: task,
  layer  : layer,
});
