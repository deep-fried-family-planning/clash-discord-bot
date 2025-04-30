import {ComponentRouter} from '#src/discord/component-router.tsx';
import {DisReact} from '#src/disreact/runtime/DisReact.ts';
import {E, L, Logger, LogLevel, pipe, RDT} from '#src/internal/pure/effect.ts';
import {makeLambda} from '@effect-aws/lambda';
import {NodeHttpClient} from '@effect/platform-node';
import {DiscordConfig, DiscordRESTMemoryLive} from 'dfx';
import type {Interaction} from 'dfx/types';
import console from 'node:console';
import process from 'node:process';

const menu = (ix: Interaction) =>
  pipe(
    DisReact.respond(ix),
    E.tapDefect((e) => {
      console.error(e);
      return E.void;
    }),
  );

const layer = pipe(
  L.mergeAll(
    ComponentRouter,
    DiscordRESTMemoryLive.pipe(
      L.provide(NodeHttpClient.layerUndici),
      L.provide(DiscordConfig.layer({
          token: RDT.make(process.env.DFFP_DISCORD_BOT_TOKEN),
        }),
      ),
    ),
  ),
  // L.provide(
  //   process.env.FULL_STACK ? FullstackDynamoDBService : RealDynamoDBService,
  // ),
  L.provideMerge(
    L.mergeAll(
      Logger.replace(Logger.defaultLogger, Logger.prettyLoggerDefault),
      Logger.minimumLogLevel(LogLevel.All),
      L.setTracerTiming(true),
      L.setTracerEnabled(true),
    ),
  ),
);

export const handler = makeLambda({
  handler: menu,
  layer  : layer,
});
