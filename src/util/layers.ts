import {DiscordRESTEnv} from 'config/external.ts';
import {ClashKing} from '#src/clash/clashking.ts';
import {ClashOfClans} from '#src/clash/clashofclans.ts';
import {DT, L, Logger} from '#src/internal/pure/effect.ts';
import {DeepFryerLogger} from '#src/service/DeepFryerLogger.ts';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import {NodeHttpClient} from '@effect/platform-node';
import {DiscordConfig, DiscordRESTMemoryLive} from 'dfx';

export const ClashLayer = L.mergeAll(
  ClashOfClans.Default,
  ClashKing.Default,
);

export const DiscordLayer = DeepFryerLogger.Default.pipe(
  L.provideMerge(DiscordRESTMemoryLive),
  L.provideMerge(NodeHttpClient.layerUndici),
  L.provideMerge(DiscordConfig.layerConfig(DiscordRESTEnv)),
);

export const NetworkLayer = L.mergeAll(
  DynamoDBDocument.defaultLayer,
);

export const BasicLayer = L.mergeAll(
  L.setTracerTiming(true),
  L.setTracerEnabled(true),
  Logger.replace(Logger.defaultLogger, Logger.structuredLogger),
  DT.layerCurrentZoneLocal,
);
