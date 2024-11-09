import {CSL, E} from '#src/internals/re-exports/effect';
import {makeLambda} from '@effect-aws/lambda';
import {logDiscordError} from '#src/internals/errors/log-discord-error.ts';
import {DiscordRESTMemoryLive} from 'dfx';

// const h = () => E.gen(function * () {
//     yield * logDiscordError([new Error('hello world')]).pipe(E.tap(CSL.log('hello world')));
//
//     h()
//
//
//
// });
// export const handler = makeLambda(h, DiscordRESTMemoryLive.pipe(
//
// ));
