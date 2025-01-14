import {ClashKing} from '#src/clash/clashking.ts';
import {ClashOfClans} from '#src/clash/clashofclans.ts';
import {ClashCache} from '#src/clash/layers/clash-cash.ts';
import {DiscordLayerLive} from '#src/discord/layer/discord-api.ts';
import {MenuCache} from '#src/dynamo/cache/menu-cache.ts';
import {createDisReactEffect} from '#src/internal/disreact/index.ts';
import {Starter} from '#src/internal/disreact/initializer.ts';
import {DT, E, g, L, Logger, LogLevel, pipe} from '#src/internal/pure/effect.ts';
import {IxRouter} from '#src/shared.ts';
import {Scheduler} from '@effect-aws/client-scheduler';
import {SQS} from '@effect-aws/client-sqs';
import {makeLambda} from '@effect-aws/lambda';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import type {Ix} from 'src/internal/disreact/entity';


const disreact = createDisReactEffect(
  {Starter},
);


const menu = (ix: Ix.Rest) => pipe(
  g(function * () {
    yield * disreact.interact(ix);
  }),
  E.catchAll((e) => E.log('[catchAll]', e)),
  E.catchAllDefect((e) => E.log('[catchAllDefect]', e)),
);


const live = pipe(
  L.empty,
  L.provideMerge(IxRouter),
  L.provideMerge(ClashCache.Live),
  L.provideMerge(MenuCache.Live),
  L.provideMerge(ClashOfClans.Live),
  L.provideMerge(ClashKing.Live),
  L.provideMerge(DiscordLayerLive),
  L.provideMerge(Scheduler.defaultLayer),
  L.provideMerge(SQS.defaultLayer),
  L.provideMerge(DynamoDBDocument.defaultLayer),
  L.provideMerge(L.setTracerTiming(true)),
  L.provideMerge(L.setTracerEnabled(true)),
  L.provideMerge(Logger.minimumLogLevel(LogLevel.Debug)),
  L.provideMerge(Logger.replace(Logger.defaultLogger, Logger.prettyLoggerDefault)),
  L.provideMerge(DT.layerCurrentZoneLocal),
);


export const handler = makeLambda(menu, live);
