import {ClashKing} from '#src/clash/clashking.ts';
import {ClashOfClans} from '#src/clash/clashofclans.ts';
import {ClashCache} from '#src/clash/layers/clash-cash.ts';
import {DeepFryerDisReact} from '#src/discord/initializer.ts';
import {DiscordLayerLive} from '#src/discord/layer/discord-api.ts';
import {MenuCache} from '#src/dynamo/cache/menu-cache.ts';
import {DisReact} from '#src/internal/disreact/create-disreact.ts';
import type {DA} from '#src/internal/disreact/virtual/entities/index.ts';
import {DT, E, g, L, Logger, LogLevel, pipe} from '#src/internal/pure/effect.ts';
import {Scheduler} from '@effect-aws/client-scheduler';
import {SQS} from '@effect-aws/client-sqs';
import {makeLambda} from '@effect-aws/lambda';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';


const menu = (ix: DA.Ix) => pipe(
  g(function * () {
    yield * DisReact.interact(ix);
  }),
  E.catchAll((e) => E.logFatal('[catchAll]', e)),
  E.catchAllDefect((e) => E.logFatal('[catchAllDefect]', e)),
);


const live = pipe(
  L.empty,
  L.provideMerge(DeepFryerDisReact),
  L.provideMerge(ClashCache.Live),
  L.provideMerge(MenuCache.Live),
  L.provideMerge(ClashOfClans.Live),
  L.provideMerge(ClashKing.Live),
  L.provideMerge(DiscordLayerLive),
  L.provideMerge(Logger.minimumLogLevel(LogLevel.All)),
  L.provideMerge(L.setTracerTiming(true)),
  L.provideMerge(L.setTracerEnabled(true)),
  L.provideMerge(DT.layerCurrentZoneLocal),
  L.provideMerge(Logger.pretty),
  L.provideMerge(pipe(
    L.empty,
    L.provideMerge(Scheduler.defaultLayer),
    L.provideMerge(SQS.defaultLayer),
    L.provideMerge(DynamoDBDocument.defaultLayer),
    L.provideMerge(Logger.minimumLogLevel(LogLevel.Fatal)),
  )),
);


export const handler = makeLambda(menu, live);
