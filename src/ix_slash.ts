import {ClashKing} from '#src/clash/clashking.ts';
import {ClashOfClans} from '#src/clash/clashofclans.ts';
import {runtimeLayer} from '#src/disreact/runtime/DisReactRuntime.ts';
import {ixsRouter} from '#src/internal/discord-old/ixs-router.ts';
import {DiscordApi, DiscordLayerLive} from '#src/internal/discord-old/layer/discord-api.ts';
import {logDiscordError} from '#src/internal/discord-old/layer/log-discord-error.ts';
import type {IxD, IxRE} from '#src/internal/discord.ts';
import {DT, E, L, Logger, pipe} from '#src/internal/pure/effect.ts';
import {Scheduler} from '@effect-aws/client-scheduler';
import {SQS} from '@effect-aws/client-sqs';
import {makeLambda} from '@effect-aws/lambda';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import {Cause} from 'effect';



const slash = (ix: IxD) => E.gen(function * () {
  yield * ixsRouter(ix);
}).pipe(
  E.catchTag('DeepFryerSlashUserError', (e) => E.gen(function * () {
    const userMessage = yield * logDiscordError([e]);

    yield * DiscordApi.editOriginalInteractionResponse(ix.application_id, ix.token, {
      ...userMessage,
      embeds: [{
        ...userMessage.embeds[0],
        title: e.issue,
      }],
    } as Partial<IxRE>);
  })),
  E.catchTag('DeepFryerClashError', (e) => E.gen(function * () {
    const userMessage = yield * logDiscordError([e]);

    yield * DiscordApi.editOriginalInteractionResponse(ix.application_id, ix.token, {
      ...userMessage,
      embeds: [{
        ...userMessage.embeds[0], // @ts-expect-error clashperk lib types
        title: `${e.original.cause.reason}: ${decodeURIComponent(e.original.cause.path as string)}`,
      }],
    } as Partial<IxRE>);
  })),
  E.catchAllCause((error) => E.gen(function * () {
    const e = Cause.prettyErrors(error);

    const userMessage = yield * logDiscordError(e);

    yield * DiscordApi.editOriginalInteractionResponse(ix.application_id, ix.token, userMessage);
  })),
);


const h = (event: IxD) => pipe(
  slash(event),
);


export const handler = makeLambda(h, pipe(
  runtimeLayer,
  L.provideMerge(DiscordLayerLive),
  L.provideMerge(ClashOfClans.Live),
  L.provideMerge(ClashKing.Live),
  L.provideMerge(Scheduler.defaultLayer),
  L.provideMerge(SQS.defaultLayer),
  L.provideMerge(DynamoDBDocument.defaultLayer),
  L.provideMerge(L.setTracerTiming(true)),
  L.provideMerge(L.setTracerEnabled(true)),
  L.provideMerge(Logger.replace(Logger.defaultLogger, Logger.structuredLogger)),
  L.provideMerge(DT.layerCurrentZoneLocal),
  L.provideMerge(L.scope),
));
