import {CFG, CSL, E, L, Logger} from '#src/internals/re-exports/effect';
import {makeLambda} from '@effect-aws/lambda';
import {logDiscordError} from '#src/internals/errors/log-discord-error.ts';
import {DiscordConfig, DiscordRESTMemoryLive} from 'dfx';
import type {SQSEvent} from 'aws-lambda';
import {REDACTED_DISCORD_BOT_TOKEN} from '#src/internals/constants/secrets.ts';
import {NodeHttpClient} from '@effect/platform-node';
import {fromParameterStore} from '@effect-aws/ssm';
import {DefaultDynamoDBDocumentServiceLayer} from '@effect-aws/lib-dynamodb';

const h = (event: SQSEvent) => E.gen(function * () {
    yield * logDiscordError([new Error('hello world')]).pipe(
        E.tap(CSL.log('hello world')),
        E.tap(CSL.log(JSON.parse(event.Records[0].body))),
    );
});

export const handler = makeLambda(h, DiscordRESTMemoryLive.pipe(
    L.provide(NodeHttpClient.layerUndici),
    L.provideMerge(DefaultDynamoDBDocumentServiceLayer),
    L.provide(DiscordConfig.layerConfig({token: CFG.redacted(REDACTED_DISCORD_BOT_TOKEN)})),
    L.provide(L.setConfigProvider(fromParameterStore())),
    L.provide(Logger.replace(Logger.defaultLogger, Logger.structuredLogger)),
));
