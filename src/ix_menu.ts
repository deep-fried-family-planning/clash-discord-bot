import {ClashKing} from '#src/clash/clashking.ts';
import {ClashOfClans} from '#src/clash/clashofclans.ts';
import {ClashCache} from '#src/clash/layers/clash-cash.ts';
import {ixcRouter} from '#src/internal/discord-old/ixc-router.ts';
import {DiscordApi, DiscordLayerLive} from '#src/internal/discord-old/layer/discord-api.ts';
import {logDiscordError} from '#src/internal/discord-old/layer/log-discord-error.ts';
import {MenuCache} from '#src/dynamo/cache/menu-cache.ts';
import type {IxD} from '#src/internal/discord.ts';
import {MGF} from '#src/internal/discord.ts';
import {CSL, DT, E, L, Logger, pipe} from '#src/internal/pure/effect.ts';
import {Scheduler} from '@effect-aws/client-scheduler';
import {SQS} from '@effect-aws/client-sqs';
import {makeLambda} from '@effect-aws/lambda';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import {Discord} from 'dfx';
import {Cause} from 'effect';



const menu = (ix: IxD) => ixcRouter(ix).pipe(
  E.catchTag('DeepFryerSlashUserError', (e) => E.gen(function * () {
    yield * CSL.error('[USER]');
    const userMessage = yield * logDiscordError([e]);

    const message = {
      ...userMessage,
      embeds: [{
        ...userMessage.embeds[0],
        title: e.issue,
      }],
    };

    return yield * pipe(
      DiscordApi.createInteractionResponse(ix.id, ix.token, {
        type: Discord.InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          ...userMessage,
          flags: MGF.EPHEMERAL,
        },
      }),
      E.catchTag('DiscordRESTError', () => DiscordApi.editMenu(ix, message)),
    );
  })),
  E.catchTag('DeepFryerClashError', (e) => E.gen(function * () {
    yield * CSL.error('[CLASH]');
    const userMessage = yield * logDiscordError([e]);

    const message = {
      ...userMessage,
      embeds: [{
        ...userMessage.embeds[0], // @ts-expect-error clashperk lib types
        title: `${e.original.cause.reason}: ${decodeURIComponent(e.original.cause.path as string)}`,
      }],
    };

    return yield * pipe(
      DiscordApi.createInteractionResponse(ix.id, ix.token, {
        type: Discord.InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          ...userMessage,
          flags: MGF.EPHEMERAL,
        },
      }),
      E.catchTag('DiscordRESTError', () => DiscordApi.editMenu(ix, message)),
    );
  })),
  E.catchAllCause((error) => E.gen(function * () {
    yield * CSL.error('[CAUSE]');

    const e = Cause.prettyErrors(error);

    const userMessage = yield * logDiscordError(e);

    yield * pipe(
      DiscordApi.createInteractionResponse(ix.id, ix.token, {
        type: Discord.InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          ...userMessage,
          flags: MGF.EPHEMERAL,
        },
      }),
      E.catchTag('DiscordRESTError', () => DiscordApi.editMenu(ix, userMessage)),
    );
  })),
  E.catchAllDefect((e) => E.gen(function * () {
    yield * CSL.error('[DEFECT]');

    const userMessage = yield * logDiscordError([e]);

    yield * pipe(
      DiscordApi.createInteractionResponse(ix.id, ix.token, {
        type: Discord.InteractionCallbackType.CHANNEL_MESSAGE_WITH_SOURCE,
        data: {
          ...userMessage,
          flags: MGF.EPHEMERAL,
        },
      }),
      E.catchTag('DiscordRESTError', () => DiscordApi.editMenu(ix, userMessage)),
    );
  })),
);


const live = pipe(
  ClashCache.Live,
  L.provideMerge(MenuCache.Live),
  L.provideMerge(L.mergeAll(
    ClashOfClans.Live,
    ClashKing.Live,
    DiscordLayerLive,
    Scheduler.defaultLayer,
    SQS.defaultLayer,
    DynamoDBDocument.defaultLayer,
  )),
  L.provideMerge(L.setTracerTiming(true)),
  L.provideMerge(L.setTracerEnabled(true)),
  L.provideMerge(Logger.replace(Logger.defaultLogger, Logger.structuredLogger)),
  L.provideMerge(DT.layerCurrentZoneLocal),
);


export const handler = makeLambda(menu, live);
