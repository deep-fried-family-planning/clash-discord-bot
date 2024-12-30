import {ClashKing} from '#src/clash/clashking.ts';
import {ClashOfClans} from '#src/clash/clashofclans.ts';
import {ClashCache} from '#src/clash/layers/clash-cash.ts';
import {ixcRouter} from '#src/discord/ixc-router.ts';
import {DiscordLayerLive} from '#src/discord/layer/discord-api.ts';
import {MenuCache} from '#src/dynamo/cache/menu-cache.ts';
import type {IxD} from '#src/internal/discord.ts';
import {DT, L, Logger, pipe} from '#src/internal/pure/effect.ts';
import {Scheduler} from '@effect-aws/client-scheduler';
import {SQS} from '@effect-aws/client-sqs';
import {makeLambda} from '@effect-aws/lambda';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';


const menu = (ix: IxD) => ixcRouter(ix).pipe(
  // E.catchTag('DeepFryerSlashUserError', (e) => E.gen(function * () {
  //     yield * CSL.error('[USER]');
  //     const userMessage = yield * logDiscordError([e]);
  //
  //     const message = {
  //         ...userMessage,
  //         embeds: [{
  //             ...userMessage.embeds[0],
  //             title: e.issue,
  //         }],
  //     };
  //
  //     return yield * pipe(
  //         DiscordApi.createInteractionResponse(ix.id, ix.token, {
  //             type: Discord.InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
  //             data: {
  //                 ...userMessage,
  //                 flags: MGF.EPHEMERAL,
  //             },
  //         }),
  //         E.catchTag('DiscordRESTError', () => DiscordApi.editMenu(ix, message)),
  //     );
  // })),
  // E.catchTag('DeepFryerClashError', (e) => E.gen(function * () {
  //     yield * CSL.error('[CLASH]');
  //     const userMessage = yield * logDiscordError([e]);
  //
  //     const message = {
  //         ...userMessage,
  //         embeds: [{...userMessage.embeds[0],
  //             title: `${e.original.cause.reason}: ${decodeURIComponent(e.original.cause.path as string)}`,
  //         }],
  //     };
  //
  //     return yield * pipe(
  //         DiscordApi.createInteractionResponse(ix.id, ix.token, {
  //             type: Discord.InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
  //             data: {
  //                 ...userMessage,
  //                 flags: MGF.EPHEMERAL,
  //             },
  //         }),
  //         E.catchTag('DiscordRESTError', () => DiscordApi.editMenu(ix, message)),
  //     );
  // })),
  // E.catchAllCause((error) => E.gen(function * () {
  //     yield * CSL.error('[CAUSE]');
  //
  //     const e = Cause.prettyErrors(error);
  //
  //     const userMessage = yield * logDiscordError(e);
  //
  //     yield * pipe(
  //         DiscordApi.createInteractionResponse(ix.id, ix.token, {
  //             type: Discord.InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
  //             data: {
  //                 ...userMessage,
  //                 flags: MGF.EPHEMERAL,
  //             },
  //         }),
  //         E.catchTag('DiscordRESTError', () => DiscordApi.editMenu(ix, userMessage)),
  //     );
  // })),
  // E.catchAllDefect((e) => E.gen(function * () {
  //     yield * CSL.error('[DEFECT]');
  //
  //     const userMessage = yield * logDiscordError([e]);
  //
  //     yield * pipe(
  //         DiscordApi.createInteractionResponse(ix.id, ix.token, {
  //             type: Discord.InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
  //             data: {
  //                 ...userMessage,
  //                 flags: MGF.EPHEMERAL,
  //             },
  //         }),
  //         E.catchTag('DiscordRESTError', () => DiscordApi.editMenu(ix, userMessage)),
  //     );
  // })),
  // Metric.trackDuration(execTime),
  // E.tap(() => g(function * () {
  //     const value = yield * Metric.value(execTime);
  //
  //     yield * CSL.debug(execTime.name, value);
  // })),
);


const live = pipe(
  ClashCache.Live,
  L.provideMerge(MenuCache.Live),
  L.provideMerge(ClashOfClans.Live),
  L.provideMerge(ClashKing.Live),
  L.provideMerge(DiscordLayerLive),
  L.provideMerge(Scheduler.defaultLayer),
  L.provideMerge(SQS.defaultLayer),
  L.provideMerge(DynamoDBDocument.defaultLayer),
  L.provideMerge(L.setTracerTiming(true)),
  L.provideMerge(L.setTracerEnabled(true)),
  L.provideMerge(Logger.replace(Logger.defaultLogger, Logger.prettyLoggerDefault)),
  L.provideMerge(DT.layerCurrentZoneLocal),
);


export const handler = makeLambda(menu, live);
