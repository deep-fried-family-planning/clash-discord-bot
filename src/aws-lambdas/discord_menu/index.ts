// pl

import {CSL, E, L, Logger, pipe} from '#src/internals/re-exports/effect.ts';
import {makeLambda} from '@effect-aws/lambda';
import {fromParameterStore} from '@effect-aws/ssm';

const h = (event: unknown) => E.gen(function * () {
    yield * CSL.log(event);
});

const LambdaLive = pipe(
    L.setConfigProvider(fromParameterStore()),
    L.provide(Logger.replace(Logger.defaultLogger, Logger.structuredLogger)),
);

export const handler = makeLambda(h, LambdaLive);
