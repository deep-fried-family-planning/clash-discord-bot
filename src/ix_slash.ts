import {ClashKing} from '#src/clash/clashking.ts';
import {ClashOfClans} from '#src/clash/clashofclans.ts';
import {ixsRouter} from '#src/discord/ixs-router.ts';
import {DiscordApi, DiscordLayerLive} from '#src/discord/layer/discord-api.ts';
import {logDiscordError} from '#src/discord/layer/log-discord-error.ts';
import {DRROOT} from '#src/disreact/index.ts';
import type {IxD, IxRE} from '#src/internal/discord.ts';
import {E, L, pipe} from '#src/internal/pure/effect.ts';
import {latency} from '#src/ix_menu.ts';
import {Scheduler} from '@effect-aws/client-scheduler';
import {SQS} from '@effect-aws/client-sqs';
import {makeLambda} from '@effect-aws/lambda';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import {Cause, Console, Metric} from 'effect';



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
  E.withLogSpan('ix_slash'),
  Metric.trackDuration(latency),
  E.tap(() => pipe(
    Metric.value(latency),
    E.flatMap((v) => Console.log(v.sum / v.count)),
  )),
);


export const handler = makeLambda(h, pipe(
  DiscordLayerLive,
  L.provideMerge(DRROOT),
  L.provideMerge(ClashOfClans.Live),
  L.provideMerge(ClashKing.Live),
  L.provideMerge(Scheduler.defaultLayer),
  L.provideMerge(SQS.defaultLayer),
  L.provideMerge(DynamoDBDocument.defaultLayer),
));
