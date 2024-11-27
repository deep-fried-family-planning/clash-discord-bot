import {CSL, DT, g, L, Logger, pipe} from '#src/internal/pure/effect.ts';
import {makeLambda} from '@effect-aws/lambda';
import type {IxD} from '#src/internal/discord.ts';
import {fromParameterStore} from '@effect-aws/ssm';


const menuClose = (ix: IxD) => g(function * () {
    CSL.log('hello world!');
});


const live = pipe(
    L.empty,
    L.provideMerge(L.setConfigProvider(fromParameterStore())),
    L.provideMerge(L.setTracerTiming(true)),
    L.provideMerge(L.setTracerEnabled(true)),
    L.provideMerge(Logger.replace(Logger.defaultLogger, Logger.structuredLogger)),
    L.provideMerge(DT.layerCurrentZoneLocal),
);


export const handler = makeLambda(menuClose, live);
