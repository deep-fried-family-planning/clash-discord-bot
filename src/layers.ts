import {ClashKing} from '#src/clash/clashking.ts';
import {ClashOfClans} from '#src/clash/clashofclans.ts';
import {CompositeCache} from '#src/database/service/CompositeCache.ts';
import {BaseClient} from '#src/database/service/BaseClient.ts';
import {DataDriver} from '#src/database/service/DataDriver.ts';
import {CapacityLimiter} from '#src/database/service/CapacityLimiter.ts';
import {DiscordLogger} from '#src/discord/DiscordLogger.ts';
import {DiscordApi} from '#src/internal/discord-old/layer/discord-api.ts';
import {DT, L, Logger, pipe, RDT} from '#src/internal/pure/effect.ts';
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

export const DatabaseLayer = DataDriver.Default.pipe(
  L.provide(CompositeCache.Default),
  L.provide(BaseClient.Default.pipe(
    L.provide(CapacityLimiter.Default),
  )),
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
