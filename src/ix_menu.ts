import {runtimeLayer} from '#src/disreact/runtime/DisReactRuntime.ts';
import {interact} from '#src/disreact/runtime/interact.ts';
import {MenuCache} from '#src/dynamo/cache/menu-cache.ts';
import type {IxD} from '#src/internal/discord.ts';
import {DT, E, L, Logger, LogLevel, pipe, RDT} from '#src/internal/pure/effect.ts';
import {makeLambda} from '@effect-aws/lambda';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import {NodeHttpClient} from '@effect/platform-node';
import {DiscordConfig, DiscordRESTMemoryLive} from 'dfx';
import console from 'node:console';
import * as process from 'node:process';



const menu = (ix: IxD) => pipe(
  E.gen(function * () {
    yield * E.logTrace('ix_menu', ix.data);
    yield * interact(ix as any).pipe(E.awaitAllChildren, E.catchAll((e) => E.sync(() => {console.error(e)})));
  }),
  E.catchAllDefect((e) => E.sync(() => {console.error(e)})),
);


const live = pipe(
  runtimeLayer,
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
  L.provideMerge(MenuCache.Live),
  L.provideMerge(DynamoDBDocument.defaultLayer.pipe(L.provide(Logger.minimumLogLevel(LogLevel.All)))),
  L.provide(DiscordRESTMemoryLive.pipe(
    L.provide(Logger.minimumLogLevel(LogLevel.None)),
    L.provide(NodeHttpClient.layerUndici),
    L.provide(DiscordConfig.layer({token: RDT.make(process.env.DFFP_DISCORD_BOT_TOKEN)})),
  )),
  L.provideMerge(Logger.replace(Logger.defaultLogger, Logger.prettyLoggerDefault)),
  L.provideMerge(Logger.minimumLogLevel(LogLevel.All)),
  L.provideMerge(L.setTracerTiming(true)),
  L.provideMerge(L.setTracerEnabled(true)),
  // L.provideMerge(Logger.replace(Logger.defaultLogger, Logger.structuredLogger)),
  L.provideMerge(DT.layerCurrentZoneLocal),
  L.provideMerge(L.scope),
);


// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const handler = makeLambda(menu, live);
