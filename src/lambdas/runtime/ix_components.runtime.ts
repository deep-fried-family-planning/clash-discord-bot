import {DeepFryerPage} from '#src/database/service/DeepFryerPage.ts';
import {DocumentCapacity} from '#src/database/service/DocumentCapacity.ts';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import {DiscordEnv, DiscordRESTEnv} from 'config/external.ts';
import {ComponentRouter} from '#src/discord/component-router.tsx';
import {E, L, Logger, LogLevel, pipe} from '#src/internal/pure/effect.ts';
import {ix_components} from '#src/lambdas/ix_components.ts';
import {DeepFryerLogger} from '#src/service/DeepFryerLogger.ts';
import {DiscordLayer} from '#src/util/layers.ts';
import {LambdaHandler} from '@effect-aws/lambda';
import {NodeHttpClient} from '@effect/platform-node';
import {DiscordConfig, DiscordRESTMemoryLive} from 'dfx';
import { DeepFryerDocument } from '#src/database/service/DeepFryerDocument';
import { Layer } from 'effect';

const layer = pipe(
  L.mergeAll(
    ComponentRouter,
    DeepFryerPage.Default,
  ),
  L.provideMerge(
    DeepFryerLogger.Default.pipe(
      L.provideMerge(DiscordRESTMemoryLive),
      L.provideMerge(NodeHttpClient.layerUndici),
      L.provideMerge(DiscordConfig.layerConfig(DiscordRESTEnv)),
    ),
  ),
  L.provideMerge(
    DeepFryerDocument.Default.pipe(
      Layer.provideMerge(DynamoDBDocument.defaultLayer),
      Layer.provide(DocumentCapacity.Default),
    ),
  ),
  L.provideMerge(
    L.mergeAll(
      Logger.replace(Logger.defaultLogger, Logger.prettyLoggerDefault),
      Logger.minimumLogLevel(LogLevel.All),
      L.setTracerTiming(true),
      L.setTracerEnabled(true),
    ),
  ),
);

export const handler = LambdaHandler.make({
  handler: ix_components,
  layer  : layer,
});
