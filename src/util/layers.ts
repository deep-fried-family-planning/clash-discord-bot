import {DiscordEnv} from '#config/external.ts';
import {ClashKing} from '#src/clash/clashking.ts';
import {ClashOfClans} from '#src/clash/clashofclans.ts';
import {DeepFryerDocument} from '#src/database/service/DeepFryerDocument.ts';
import {DocumentCapacity} from '#src/database/service/DocumentCapacity.ts';
import {DeepFryerLogger} from '#src/service/DeepFryerLogger.ts';
import {DiscordApi} from '#src/internal/discord-old/layer/discord-api.ts';
import {DT, L, Logger} from '#src/internal/pure/effect.ts';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import {NodeHttpClient} from '@effect/platform-node';
import {DiscordConfig, DiscordRESTMemoryLive} from 'dfx';
import {Effect} from 'effect';

export const ClashLayer = L.mergeAll(
  ClashOfClans.Default,
  ClashKing.Default,
);

export const DiscordLayer = DeepFryerLogger.Default.pipe(
  L.provideMerge(DiscordApi.Live),
  L.provideMerge(DiscordRESTMemoryLive),
  L.provide(L.unwrapEffect(
    Effect.map(DiscordEnv, (env) =>
      DiscordConfig.layer({
        token: env.DFFP_DISCORD_BOT_TOKEN,
      }),
    ),
  )),
);

export const DatabaseLayer = DeepFryerDocument.Default.pipe(
  L.provide(DocumentCapacity.Default),
);

export const NetworkLayer = L.mergeAll(
  DynamoDBDocument.defaultLayer,
  NodeHttpClient.layer,
);

export const BasicLayer = L.mergeAll(
  L.setTracerTiming(true),
  L.setTracerEnabled(true),
  Logger.replace(Logger.defaultLogger, Logger.structuredLogger),
  DT.layerCurrentZoneLocal,
);
