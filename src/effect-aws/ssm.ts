import {fromParameterStore} from '@effect-aws/ssm';
import {Cfg, E, L, pipe} from '#src/utils/effect.ts';
import * as process from 'node:process';
import {SSM_counter} from '#src/internals/metrics.ts';

export const SSM_PROVIDER = fromParameterStore();
const ENV = process.env.LAMBDA_ENV.toUpperCase();

const config = pipe(
    Cfg.all([
        Cfg.string(`/DFFP/${ENV}/DISCORD_APP_ID`),
        Cfg.string(`/DFFP/${ENV}/DISCORD_PUBLIC_KEY`),
        Cfg.string(`/DFFP/${ENV}/DISCORD_CLIENT_ID`),
        Cfg.string(`/DFFP/${ENV}/DISCORD_CLIENT_SECRET`),
        Cfg.string(`/DFFP/${ENV}/DISCORD_BOT_TOKEN`),
        Cfg.string(`/DFFP/${ENV}/DISCORD_ERROR_URL`),
        Cfg.string(`/DFFP/${ENV}/DISCORD_DEBUG_URL`),
        Cfg.string(`/DFFP/${ENV}/COC_USER`),
        Cfg.string(`/DFFP/${ENV}/COC_PASSWORD`),
        Cfg.string(`/DFFP/${ENV}/COC_KEY`),
    ]),
    SSM_counter,
    E.cached,
);

const prog = E.gen(function* () {
    const cachedParams = yield * (config);

    const [
        DISCORD_APP_ID,
        DISCORD_PUBLIC_KEY,
        DISCORD_CLIENT_ID,
        DISCORD_CLIENT_SECRET,
        DISCORD_BOT_TOKEN,
        DISCORD_ERROR_URL,
        DISCORD_DEBUG_URL,
        COC_USER,
        COC_PASSWORD,
        COC_KEY,
    ] = yield * cachedParams;

    return {
        DISCORD_APP_ID,
        DISCORD_PUBLIC_KEY,
        DISCORD_CLIENT_ID,
        DISCORD_CLIENT_SECRET,
        DISCORD_BOT_TOKEN,
        DISCORD_ERROR_URL,
        DISCORD_DEBUG_URL,
        COC_USER,
        COC_PASSWORD,
        COC_KEY,
    };
});

export const SSM = pipe(
    prog,
    E.provide(L.setConfigProvider(SSM_PROVIDER)),
    E.cached,
);

export const SSM_GET = E.gen(function * () {
    const task = yield * SSM;
    return yield * task;
});
