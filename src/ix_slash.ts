import {makeLambda} from '@effect-aws/lambda';
import {DT, E, L, Logger, pipe} from '#src/internal/pure/effect.ts';
import {ClashOfClans} from '#src/clash/clashofclans.ts';
import {ClashKing} from '#src/clash/clashking.ts';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import {SQS} from '@effect-aws/client-sqs';
import {Scheduler} from '@effect-aws/client-scheduler';
import {DiscordApi, DiscordLayerLive} from '#src/discord/layer/discord-api.ts';
import type {SQSEvent} from 'aws-lambda';
import {mapL} from '#src/internal/pure/pure-list.ts';
import type {IxRE} from '#src/internal/discord.ts';
import type {IxD} from '#src/internal/discord.ts';
import {logDiscordError} from '#src/discord/layer/log-discord-error.ts';
import {Cause} from 'effect';
import {ixsRouter} from '#src/discord/ixs-router.ts';
import {fromParameterStore} from '@effect-aws/ssm';


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
            embeds: [{...userMessage.embeds[0], // @ts-expect-error clashperk lib types
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


const h = (event: SQSEvent) => pipe(
    event.Records,
    mapL((record) => slash(JSON.parse(record.body) as IxD)),
    E.all,
);


export const handler = makeLambda(h, pipe(
    DiscordLayerLive,
    L.provideMerge(L.mergeAll(
        ClashOfClans.Live,
        ClashKing.Live,
        Scheduler.defaultLayer,
        SQS.defaultLayer,
        DynamoDBDocument.defaultLayer,
    )),
    L.provideMerge(L.setConfigProvider(fromParameterStore())),
    L.provideMerge(L.setTracerTiming(true)),
    L.provideMerge(L.setTracerEnabled(true)),
    L.provideMerge(Logger.replace(Logger.defaultLogger, Logger.structuredLogger)),
    L.provideMerge(DT.layerCurrentZoneLocal),
));
