import {ClashKing} from '#src/service/ClashKing.ts';
import {ClashOfClans} from '#src/service/ClashOfClans.ts';
import {DeepFryerLogger} from '#src/service/DeepFryerLogger.ts';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import {NodeHttpClient} from '@effect/platform-node';
import {DiscordRESTEnv} from 'config/external.ts';
import {DiscordConfig, DiscordRESTMemoryLive} from 'dfx';
import * as DT from 'effect/DateTime';
import * as L from 'effect/Layer';
import * as Logger from 'effect/Logger';

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
