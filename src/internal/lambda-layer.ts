import {DT, L} from '#src/internal/pure/effect.ts';
import {Logger, pipe} from '#src/internal/pure/effect.ts';
import {fromParameterStore} from '@effect-aws/ssm';
import type {Layer} from 'effect/Layer';
/* eslint-disable @typescript-eslint/no-explicit-any */


export const makeLambdaLayer = <T extends [Layer<never, any, any>, ...Array<Layer<never, any, any>>]>(
    layers: {
        caches?: T;
        apis?  : T;
        aws?   : T;
    },
) => {
    const {
        caches = [L.empty] as unknown as T,
        apis = [L.empty] as unknown as T,
        aws = [L.empty] as unknown as T,
    } = layers;


    return pipe(
        // L.setUnhandledErrorLogLevel(Option.fromNullable(LogLevel.Fatal)),
        L.mergeAll(...caches),
        L.provideMerge(L.mergeAll(...apis)),
        L.provideMerge(L.mergeAll(...aws)),
        L.provide(L.setConfigProvider(fromParameterStore())),
        L.provide(L.setTracerTiming(true)),
        L.provide(L.setTracerTiming(true)),
        L.provide(L.setTracerEnabled(true)),
        L.provide(Logger.replace(Logger.defaultLogger, Logger.structuredLogger)),
        L.provide(DT.layerCurrentZoneLocal),
    );
};
