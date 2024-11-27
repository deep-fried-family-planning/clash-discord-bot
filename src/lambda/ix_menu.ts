import {CSL, DT, E, L, Logger, pipe} from '#src/internal/pure/effect.ts';
import {makeLambda} from '@effect-aws/lambda';
import {MGF} from '#src/internal/discord.ts';
import type {IxD} from '#src/internal/discord.ts';
import {Cause} from 'effect';
import {logDiscordError} from '#src/discord/layer/log-discord-error.ts';
import {DiscordApi, DiscordLayerLive} from '#src/discord/layer/discord-api.ts';
import {Discord} from 'dfx';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import {ixcRouter} from '#src/discord/ixc-router.ts';
import {MenuCache} from '#src/dynamo/cache/menu-cache.ts';
import {ClashCache} from '#src/clash/layers/clash-cash.ts';
import {Scheduler} from '@effect-aws/client-scheduler';
import {SQS} from '@effect-aws/client-sqs';
import {fromParameterStore} from '@effect-aws/ssm';
import {ClashOfClans} from "#src/clash/clashofclans.ts";
import {ClashKing} from "#src/clash/clashking.ts";


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
            embeds: [{...userMessage.embeds[0], // @ts-expect-error clashperk lib types
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
    L.provideMerge(L.mergeAll(
        MenuCache.Live,
        ClashOfClans.Live,
        ClashKing.Live,
        DiscordLayerLive,
        Scheduler.defaultLayer,
        SQS.defaultLayer,
        DynamoDBDocument.defaultLayer,
    )),
    L.provideMerge(L.setConfigProvider(fromParameterStore())),
    L.provideMerge(L.setTracerTiming(true)),
    L.provideMerge(L.setTracerEnabled(true)),
    L.provideMerge(Logger.replace(Logger.defaultLogger, Logger.structuredLogger)),
    L.provideMerge(DT.layerCurrentZoneLocal),
);


export const handler = makeLambda(menu, live);
