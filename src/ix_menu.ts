/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-argument */
import {ClashKing} from '#src/clash/clashking.ts';
import {ClashOfClans} from '#src/clash/clashofclans.ts';
import {ClashCache} from '#src/clash/layers/clash-cash.ts';
import {DeepFryerModel} from '#src/discord/deep-fryer-model.ts';
import {DisReactDOM} from '#src/disreact/index.ts';
import {MenuCache} from '#src/dynamo/cache/menu-cache.ts';
import {ixcRouter} from '#src/internal/discord-old/ixc-router.ts';
import {DiscordApi, DiscordLayerLive} from '#src/internal/discord-old/layer/discord-api.ts';
import {logDiscordError} from '#src/internal/discord-old/layer/log-discord-error.ts';
import type {IxD} from '#src/internal/discord.ts';
import {MGF} from '#src/internal/discord.ts';
import {CSL, DT, E, L, Logger, LogLevel, pipe, RDT} from '#src/internal/pure/effect.ts';
import config from '@commitlint/config-conventional';
import {Scheduler} from '@effect-aws/client-scheduler';
import {SQS} from '@effect-aws/client-sqs';
import {makeLambda} from '@effect-aws/lambda';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import {NodeHttpClient} from '@effect/platform-node';
import {Discord, DiscordConfig, DiscordRESTMemoryLive} from 'dfx';
import {Cause} from 'effect';
import * as process from 'node:process';



const menu = (ix: IxD) => E.gen(function * () {
  yield * E.logTrace('ix_menu', ix.data);
  yield * DisReactDOM.respond(ix as any);
});


const live = pipe(
  DeepFryerModel,
  // L.provideMerge(ClashCache.Live),
  // L.provideMerge(MenuCache.Live),
  // L.provideMerge(L.mergeAll(
  //   ClashOfClans.Live,
  //   ClashKing.Live,
  //   DiscordLayerLive,
  //   Scheduler.defaultLayer,
  //   SQS.defaultLayer,
  //   DynamoDBDocument.defaultLayer,
  // )),
  L.provide(DynamoDBDocument.defaultLayer.pipe(L.provide(Logger.minimumLogLevel(LogLevel.None)))),
  L.provide(DiscordRESTMemoryLive.pipe(
    L.provide(Logger.minimumLogLevel(LogLevel.None)),
    L.provide(NodeHttpClient.layerUndici),
    L.provide(DiscordConfig.layer({token: RDT.make(process.env.DFFP_DISCORD_BOT_TOKEN)})),
  )),
  L.provideMerge(L.setTracerTiming(true)),
  L.provideMerge(L.setTracerEnabled(true)),
  // L.provideMerge(Logger.replace(Logger.defaultLogger, Logger.structuredLogger)),
  L.provideMerge(DT.layerCurrentZoneLocal),
);


export const handler = makeLambda(menu, live);
