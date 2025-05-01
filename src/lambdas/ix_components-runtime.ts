import {DiscordEnv} from '#config/external.ts';
import {ComponentRouter} from '#src/discord/component-router.tsx';
import {E, L, Logger, LogLevel, pipe} from '#src/internal/pure/effect.ts';
import {ix_components} from '#src/lambdas/ix_components.ts';
import {LambdaHandler} from '@effect-aws/lambda';
import {NodeHttpClient} from '@effect/platform-node';
import {DiscordConfig, DiscordRESTMemoryLive} from 'dfx';

const layer = pipe(
  L.mergeAll(
    ComponentRouter,
    DiscordRESTMemoryLive.pipe(
      L.provide(NodeHttpClient.layerUndici),
      L.provideMerge(
        L.unwrapEffect(E.map(DiscordEnv, (env) =>
          DiscordConfig.layer({
            token: env.DFFP_DISCORD_BOT_TOKEN,
          }),
        )),
      ),
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
