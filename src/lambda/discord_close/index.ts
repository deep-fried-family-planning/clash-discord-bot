import type {MessageComponentDatum, ModalSubmitDatum} from 'dfx/types';
import {E, L, Logger, pipe} from '#src/internal/pure/effect.ts';
import {RK_CLOSE} from '#src/internal/constants/route-kind.ts';
import type {IxD} from '#src/discord/util/discord.ts';
import {fromId} from '#src/discord/store/id-parse.ts';
import {makeLambda} from '@effect-aws/lambda';


const h = (body: IxD) => E.gen(function * () {

});

const LambdaLive = pipe(
    L.provide(Logger.replace(Logger.defaultLogger, Logger.structuredLogger)),
);

export const handler = makeLambda(h, LambdaLive);
