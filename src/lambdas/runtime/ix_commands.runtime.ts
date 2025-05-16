import {ClashKing} from '#src/clash/clashking.ts';
import {ClashOfClans} from '#src/clash/clashofclans.ts';
import {DataClient} from '#src/data/service/DataClient.ts';
import {DiscordRESTEnv} from 'config/external.ts';
import {ComponentRouter} from '#src/discord/component-router.tsx';
import {DT, L, Logger, pipe} from '#src/internal/pure/effect.ts';
import {ix_commands} from '#src/lambdas/ix_commands.ts';
import {DeepFryerLogger} from '#src/service/DeepFryerLogger.ts';
import {Scheduler} from '@effect-aws/client-scheduler';
import {SQS} from '@effect-aws/client-sqs';
import {LambdaHandler} from '@effect-aws/lambda';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import {NodeHttpClient} from '@effect/platform-node';
import {DiscordConfig, DiscordRESTMemoryLive} from 'dfx';

const layer = pipe(
  L.mergeAll(
    ComponentRouter,
    ClashOfClans.Default,
    ClashKing.Default,
    Scheduler.defaultLayer,
    SQS.defaultLayer,
    DataClient.Default,
    DeepFryerLogger.Default.pipe(
      L.provideMerge(DiscordRESTMemoryLive),
      L.provideMerge(NodeHttpClient.layerUndici),
      L.provideMerge(DiscordConfig.layerConfig(DiscordRESTEnv)),
    ),
  ),
  L.provideMerge(
    L.mergeAll(
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
