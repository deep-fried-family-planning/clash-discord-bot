import {ClashKing} from '#src/clash/clashking.ts';
import {ClashOfClans} from '#src/clash/clashofclans.ts';
import {DeepFryerPage} from '#src/database/service/DeepFryerPage.ts';
import {ComponentRouter} from '#src/discord/component-router.tsx';
import {DiscordLayerLive} from '#src/internal/discord-old/layer/discord-api.ts';
import {DT, L, Logger, pipe} from '#src/internal/pure/effect.ts';
import {ix_commands} from '#src/lambdas/ix_commands.ts';
import {DeepFryerLogger} from '#src/service/DeepFryerLogger.ts';
import {DatabaseLayer} from '#src/util/layers.ts';
import {Scheduler} from '@effect-aws/client-scheduler';
import {SQS} from '@effect-aws/client-sqs';
import {LambdaHandler} from '@effect-aws/lambda';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';

const layer = pipe(
  L.mergeAll(
    ComponentRouter,
    ClashOfClans.Default,
    ClashKing.Default,
    Scheduler.defaultLayer,
    SQS.defaultLayer,
    DeepFryerPage.Default,
    DeepFryerLogger.Default,
  ),
  L.provideMerge(DiscordLayerLive),
  L.provideMerge(
    L.mergeAll(
      DatabaseLayer,
      L.setTracerTiming(true),
      L.setTracerEnabled(true),
      Logger.replace(Logger.defaultLogger, Logger.structuredLogger),
      DT.layerCurrentZoneLocal,
    ),
  ),
  L.provideMerge(DynamoDBDocument.defaultLayer),
);

export const handler = LambdaHandler.make({
  handler: ix_commands,
  layer  : layer,
});
