import {CSL, E, L, Logger} from '#src/internals/re-exports/effect';
import {makeLambda} from '@effect-aws/lambda';
import {logDiscordError} from '#src/internals/errors/log-discord-error.ts';
import {DiscordRESTMemoryLive} from 'dfx';
import type {SQSEvent} from 'aws-lambda';

const h = (event: SQSEvent) => E.gen(function * () {
    yield * logDiscordError([new Error('hello world')]).pipe(
        E.tap(CSL.log('hello world')),
        E.tap(CSL.log(JSON.parse(event.Records[0].body))),
    );
});

export const handler = makeLambda(h, DiscordRESTMemoryLive.pipe(
    L.provide(Logger.replace(Logger.defaultLogger, Logger.structuredLogger)),
));
