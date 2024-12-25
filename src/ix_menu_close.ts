import {DiscordLayerLive} from '#src/discord/layer/discord-api.ts';
import type {IxD} from '#src/internal/discord.ts';
import {CSL, DT, g, L, Logger, pipe} from '#src/internal/pure/effect.ts';
import {makeLambda} from '@effect-aws/lambda';


const menuClose = (ix: IxD) => g(function * () {
    yield * CSL.debug('delete');
});


const live = pipe(
    DiscordLayerLive,
    L.provideMerge(L.setTracerTiming(true)),
    L.provideMerge(L.setTracerEnabled(true)),
    L.provideMerge(Logger.replace(Logger.defaultLogger, Logger.structuredLogger)),
    L.provideMerge(DT.layerCurrentZoneLocal),
);

export const handler = makeLambda(menuClose, live);
