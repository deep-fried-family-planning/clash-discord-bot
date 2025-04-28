import {ClashKing} from '#src/clash/clashking.ts';
import {ClashOfClans} from '#src/clash/clashofclans.ts';
import {commandRouter} from '#src/discord/command-router.ts';
import {ComponentRouter} from '#src/discord/component-router.tsx';
import {DiscordApi, DiscordLayerLive} from '#src/internal/discord-old/layer/discord-api.ts';
import {logDiscordError} from '#src/internal/discord-old/layer/log-discord-error.ts';
import type {IxD, IxRE} from '#src/internal/discord-old/discord.ts';
import {DT, E, L, Logger, pipe} from '#src/internal/pure/effect.ts';
import {Scheduler} from '@effect-aws/client-scheduler';
import {SQS} from '@effect-aws/client-sqs';
import {makeLambda} from '@effect-aws/lambda';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import {Cause} from 'effect';

const slash = (ix: IxD) => pipe(
  commandRouter(ix),
  E.catchTag('DeepFryerSlashUserError', (e) => E.gen(function* () {
    const userMessage = yield* logDiscordError([e]);

    yield* DiscordApi.editOriginalInteractionResponse(ix.application_id, ix.token, {
      ...userMessage,
      embeds: [{
        ...userMessage.embeds[0],
        title: e.issue,
      }],
    } as Partial<IxRE>);
  })),
  E.catchTag('DeepFryerClashError', (e) => E.gen(function* () {
    const userMessage = yield* logDiscordError([e]);

    yield* DiscordApi.editOriginalInteractionResponse(ix.application_id, ix.token, {
      ...userMessage,
      embeds: [{
        ...userMessage.embeds[0],
        // @ts-expect-error temporary
        title: `${e.original.cause.reason}: ${decodeURIComponent(e.original.cause.path as string)}`,
      }],
    } as Partial<IxRE>);
  })),
  E.catchAllCause((error) => E.gen(function* () {
    const e = Cause.prettyErrors(error);

    const userMessage = yield* logDiscordError(e);

    yield* DiscordApi.editOriginalInteractionResponse(ix.application_id, ix.token, userMessage);
  })),
);

const layer = pipe(
  L.mergeAll(
    ComponentRouter,
    DiscordLayerLive,
    ClashOfClans.Live,
    ClashKing.Live,
    Scheduler.defaultLayer,
    SQS.defaultLayer,
  ),
  L.provideMerge(
    L.mergeAll(
      L.setTracerTiming(true),
      L.setTracerEnabled(true),
      Logger.replace(Logger.defaultLogger, Logger.structuredLogger),
      DT.layerCurrentZoneLocal,
    ),
  ),
  L.provideMerge(DynamoDBDocument.defaultLayer),
);

export const handler = makeLambda({
  handler: slash,
  layer  : layer,
});
