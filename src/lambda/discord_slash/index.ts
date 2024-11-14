import {makeLambda} from '@effect-aws/lambda';
import {CFG, DT, E, L, Logger, pipe} from '#src/internal/pure/effect.ts';
import {DiscordConfig, DiscordRESTMemoryLive} from 'dfx';
import {NodeHttpClient} from '@effect/platform-node';
import {fromParameterStore} from '@effect-aws/ssm';
import {REDACTED_DISCORD_BOT_TOKEN} from '#src/internal/constants/secrets.ts';
import {Clashofclans} from '#src/clash/api/clashofclans.ts';
import {Clashking} from '#src/clash/api/clashking.ts';
import {DynamoDBDocumentService} from '@effect-aws/lib-dynamodb';
import {SQSService} from '@effect-aws/client-sqs';
import {SchedulerService} from '@effect-aws/client-scheduler';
import {DiscordApi} from '#src/discord/layer/discord-api.ts';
import type {SQSEvent} from 'aws-lambda';
import {mapL} from '#src/internal/pure/pure-list.ts';
import type {IxD} from '#src/discord/util/discord.ts';
import {logDiscordError} from '#src/discord/layer/log-discord-error.ts';
import type {EditWebhookMessageParams} from 'dfx/types';
import {Cause} from 'effect';
import {ixsRouter} from '#src/discord/ixs/ixs-router.ts';


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
        } as Partial<EditWebhookMessageParams>);
    })),
    E.catchTag('DeepFryerClashError', (e) => E.gen(function * () {
        const userMessage = yield * logDiscordError([e]);

        yield * DiscordApi.editOriginalInteractionResponse(ix.application_id, ix.token, {
            ...userMessage,
            embeds: [{
                ...userMessage.embeds[0],
                // @ts-expect-error clashperk lib types
                title: `${e.original.cause.reason}: ${decodeURIComponent(e.original.cause.path as string)}`,
            }],
        } as Partial<EditWebhookMessageParams>);
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


const LambdaLayer = pipe(
    DiscordApi.Live,
    L.provideMerge(Clashofclans.Live),
    L.provideMerge(Clashking.Live),
    L.provideMerge(DT.layerCurrentZoneLocal),
    L.provideMerge(SchedulerService.defaultLayer),
    L.provideMerge(SQSService.defaultLayer),
    L.provideMerge(DynamoDBDocumentService.defaultLayer),
    L.provideMerge(DiscordRESTMemoryLive),
    L.provide(DiscordConfig.layerConfig({token: CFG.redacted(REDACTED_DISCORD_BOT_TOKEN)})),
    L.provide(NodeHttpClient.layerUndici),
    L.provide(L.setConfigProvider(fromParameterStore())),
    L.provide(Logger.replace(Logger.defaultLogger, Logger.structuredLogger)),
);


export const handler = makeLambda(h, LambdaLayer);
