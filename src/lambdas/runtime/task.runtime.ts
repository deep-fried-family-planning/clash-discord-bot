import {ClashOfClans} from '#src/clash/clashofclans.ts';
import {DiscordLayerLive} from '#src/internal/discord-old/layer/discord-api.ts';
import {L, pipe} from '#src/internal/pure/effect.ts';
import {task} from '#src/lambdas/task.ts';
import {BaseLambdaLayer} from '#src/lambdas/util.ts';
import {DeepFryerLogger} from '#src/service/DeepFryerLogger.ts';
import {EventRouterLive} from '#src/service/EventRouter.ts';
import {LambdaHandler} from '@effect-aws/lambda';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';

const layer = pipe(
  L.mergeAll(
    EventRouterLive,
    DeepFryerLogger.Default,
    ClashOfClans.Default,
  ),
  L.provideMerge(DiscordLayerLive),
  L.provideMerge(DynamoDBDocument.defaultLayer),
  L.provideMerge(BaseLambdaLayer),
);

export const handler = LambdaHandler.make({
  handler: task,
  layer  : layer,
});
