import {ClashKing} from '#src/clash/clashking.ts';
import {ClashOfClans} from '#src/clash/clashofclans.ts';
import {ClashCache} from '#src/clash/layers/clash-cash.ts';
import type {Rest} from '#src/disreact/enum/index.ts';
import {DisReactDOM, DRROOT} from '#src/disreact/index.ts';
import {MenuCache} from '#src/dynamo/cache/menu-cache.ts';
import {E, L, pipe} from '#src/internal/pure/effect.ts';
import {Scheduler} from '@effect-aws/client-scheduler';
import {SQS} from '@effect-aws/client-sqs';
import {makeLambda} from '@effect-aws/lambda';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import {Array, Console, Metric } from 'effect';



export const latency = Metric.timerWithBoundaries('timer', Array.range(1, 10));

const menu = (ix: Rest.Interaction) => DisReactDOM.respond(ix).pipe(
  // E.catchAllCause(Console.error),
  // E.catchAllDefect(Console.error),
  // E.catchTag('DeepFryerSlashUserError', (e) => E.gen(function * () {
  //   yield * CSL.error('[USER]');
  //   const userMessage = yield * logDiscordError([e]);
  //
  //   const message = {
  //     ...userMessage,
  //     embeds: [{
  //       ...userMessage.embeds[0],
  //       title: e.issue,
  //     }],
  //   };
  //
  //   return yield * pipe(
  //     DiscordApi.createInteractionResponse(ix.id, ix.token, {
  //       type: Discord.InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
  //       data: {
  //         ...userMessage,
  //         flags: MGF.EPHEMERAL,
  //       },
  //     }),
  //     E.catchTag('DiscordRESTError', () => DiscordApi.editMenu(ix, message)),
  //   );
  // })),
  // E.catchTag('DeepFryerClashError', (e) => E.gen(function * () {
  //   yield * CSL.error('[CLASH]');
  //   const userMessage = yield * logDiscordError([e]);
  //
  //   const message = {
  //     ...userMessage,
  //     embeds: [{
  //       ...userMessage.embeds[0], // @ts-expect-error clashperk lib types
  //       title: `${e.original.cause.reason}: ${decodeURIComponent(e.original.cause.path as string)}`,
  //     }],
  //   };
  //
  //   return yield * pipe(
  //     DiscordApi.createInteractionResponse(ix.id, ix.token, {
  //       type: Discord.InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
  //       data: {
  //         ...userMessage,
  //         flags: MGF.EPHEMERAL,
  //       },
  //     }),
  //     E.catchTag('DiscordRESTError', () => DiscordApi.editMenu(ix, message)),
  //   );
  // })),
  // E.catchAllCause((error) => E.gen(function * () {
  //   yield * CSL.error('[CAUSE]');
  //
  //   const e = Cause.prettyErrors(error);
  //
  //   const userMessage = yield * logDiscordError(e);
  //
  //   yield * pipe(
  //     DiscordApi.createInteractionResponse(ix.id, ix.token, {
  //       type: Discord.InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
  //       data: {
  //         ...userMessage,
  //         flags: MGF.EPHEMERAL,
  //       },
  //     }),
  //     E.catchTag('DiscordRESTError', () => DiscordApi.editMenu(ix, userMessage)),
  //   );
  // })),
  // E.catchAllDefect((e) => E.gen(function * () {
  //   yield * CSL.error('[DEFECT]');
  //
  //   const userMessage = yield * logDiscordError([e]);
  //
  //   yield * pipe(
  //     DiscordApi.createInteractionResponse(ix.id, ix.token, {
  //       type: Discord.InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
  //       data: {
  //         ...userMessage,
  //         flags: MGF.EPHEMERAL,
  //       },
  //     }),
  //     E.catchTag('DiscordRESTError', () => DiscordApi.editMenu(ix, userMessage)),
  //   );
  // })),
  E.awaitAllChildren,
  E.withLogSpan('ix_menu'),
  Metric.trackDuration(latency),
  E.tap(() => pipe(
    Metric.value(latency),
    E.flatMap((v) => pipe(
      Console.log(v.sum / v.count),
      E.tap(Console.log(v.min)),
    )),
  )),
);


const live = pipe(
  DRROOT,
  L.provideMerge(ClashCache.Live),
  L.provideMerge(MenuCache.Live),
  L.provideMerge(L.mergeAll(
    ClashOfClans.Live,
    ClashKing.Live,
    // DiscordLayerLive,
    Scheduler.defaultLayer,
    SQS.defaultLayer,
    // DynamoDBDocument.defaultLayer,
  )),
);


export const handler = makeLambda(menu, live);
