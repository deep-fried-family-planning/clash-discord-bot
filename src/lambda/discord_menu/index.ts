import {CSL, E, pipe} from '#src/internal/pure/effect.ts';
import {makeLambda} from '@effect-aws/lambda';
import {MGF} from '#src/discord/util/discord.ts';
import type {IxD} from '#src/discord/util/discord.ts';
import {Cause} from 'effect';
import {logDiscordError} from '#src/discord/layer/log-discord-error.ts';
import {DiscordApi, DiscordLayerLive} from '#src/discord/layer/discord-api.ts';
import {Discord} from 'dfx';
import {Clashofclans} from '#src/clash/api/clashofclans.ts';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import {ixcRouter} from '#src/discord/ixc/ixc-router.ts';
import {makeLambdaLayer} from '#src/internal/lambda-layer.ts';
import {MenuCache} from '#src/dynamo/cache/menu-cache.ts';


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


export const handler = makeLambda(menu, makeLambdaLayer({
    caches: [
        MenuCache.Live,
    ],
    apis: [
        Clashofclans.Live,
        DiscordLayerLive,
    ],
    aws: [
        DynamoDBDocument.defaultLayer,
    ],
}));
