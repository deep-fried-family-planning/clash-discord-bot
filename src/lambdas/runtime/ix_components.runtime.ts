import {DataClient} from '#src/data/service/DataClient.ts';
import {ComponentRouter} from '#src/discord/component-router.tsx';
import {L, Logger, LogLevel, pipe} from '#src/internal/pure/effect.ts';
import {ix_components} from '#src/lambdas/ix_components.ts';
import {DeepFryerLogger} from '#src/service/DeepFryerLogger.ts';
import {LambdaHandler} from '@effect-aws/lambda';
import {NodeHttpClient} from '@effect/platform-node';
import {DiscordRESTEnv} from 'config/external.ts';
import {DiscordConfig, DiscordRESTMemoryLive} from 'dfx';

const layer = pipe(
  L.mergeAll(
    ComponentRouter,
    DataClient.Default,
    // ClashOfClans.Default,
    // ClashKing.Default,
  ),
  L.provideMerge(
    DeepFryerLogger.Default.pipe(
      L.provideMerge(DiscordRESTMemoryLive),
      L.provideMerge(NodeHttpClient.layerUndici),
      L.provideMerge(DiscordConfig.layerConfig(DiscordRESTEnv)),
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
