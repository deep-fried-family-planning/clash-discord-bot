import {ClashKing} from '#src/clash/clashking.ts';
import {ClashOfClans} from '#src/clash/clashofclans.ts';
import {DocumentCapacity} from '#src/database/service/DocumentCapacity.ts';
import {DeepFryerDocument} from '#src/database/service/DeepFryerDocument.ts';
import {DiscordLogger} from '#src/discord/DiscordLogger.ts';
import {DiscordApi} from '#src/internal/discord-old/layer/discord-api.ts';
import {DT, L, Logger, RDT} from '#src/internal/pure/effect.ts';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import {NodeHttpClient} from '@effect/platform-node';
import {DiscordConfig, DiscordRESTMemoryLive} from 'dfx';

export const ClashLayer = L.mergeAll(
  ClashOfClans.Live,
  ClashKing.Live,
);

export const DiscordLayer = DiscordLogger.Default.pipe(
  L.provideMerge(DiscordApi.Live),
  L.provideMerge(DiscordRESTMemoryLive),
  L.provide(DiscordConfig.layer({
    token: RDT.make(process.env.DFFP_DISCORD_BOT_TOKEN),
  })),
);

export const DatabaseLayer = DeepFryerDocument.Default.pipe(
  L.provide(DocumentCapacity.Default),
);

export const NetworkLayer = L.mergeAll(
  DynamoDBDocument.defaultLayer,
  NodeHttpClient.layerUndici,
);

export const BasicLayer = L.mergeAll(
  L.setTracerTiming(true),
  L.setTracerEnabled(true),
  Logger.replace(Logger.defaultLogger, Logger.structuredLogger),
  DT.layerCurrentZoneLocal,
);
