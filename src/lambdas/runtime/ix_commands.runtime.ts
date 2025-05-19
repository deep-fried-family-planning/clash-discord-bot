import {ComponentRouter} from '#src/discord/component-router.tsx';
import {ix_commands} from '#src/lambdas/ix_commands.ts';
import {ClashKing} from '#src/service/ClashKing.ts';
import {ClashOfClans} from '#src/service/ClashOfClans.ts';
import {DataClient} from '#src/service/DataClient.ts';
import {DeepFryerLogger} from '#src/service/DeepFryerLogger.ts';
import {Scheduler} from '@effect-aws/client-scheduler';
import {SQS} from '@effect-aws/client-sqs';
import {LambdaHandler} from '@effect-aws/lambda';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import {NodeHttpClient} from '@effect/platform-node';
import {DiscordRESTEnv} from 'config/external.ts';
import {DiscordConfig, DiscordRESTMemoryLive} from 'dfx';
import {LogLevel} from 'effect';
import * as DT from 'effect/DateTime';
import {pipe} from 'effect/Function';
import * as L from 'effect/Layer';
import * as Logger from 'effect/Logger';

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
      Logger.minimumLogLevel(LogLevel.All),
      DT.layerCurrentZoneLocal,
    ),
  ),
  L.provideMerge(DynamoDBDocument.defaultLayer),
);

export const handler = LambdaHandler.make({
  handler: ix_commands,
  layer  : layer,
});
