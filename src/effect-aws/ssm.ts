import {fromParameterStore} from '@effect-aws/ssm';
import {Cfg, E, L, pipe} from '#src/utils/effect.ts';

const prog = E.gen(function* () {
    const param = yield * Cfg.all([
        Cfg.redacted(`/DFFP/PROD/DISCORD_APP_ID`),
        Cfg.redacted(`/DFFP/PROD/DISCORD_PUBLIC_KEY`),
        Cfg.redacted(`/DFFP/PROD/DISCORD_CLIENT_ID`),
        Cfg.redacted(`/DFFP/PROD/DISCORD_CLIENT_SECRET`),
        Cfg.redacted(`/DFFP/PROD/DISCORD_BOT_TOKEN`),
        Cfg.redacted(`/DFFP/PROD/DISCORD_ERROR_URL`),
        Cfg.redacted(`/DFFP/PROD/DISCORD_DEBUG_URL`),
        Cfg.redacted(`/DFFP/PROD/COC_USER`),
        Cfg.redacted(`/DFFP/PROD/COC_PASSWORD`),
        Cfg.redacted(`/DFFP/PROD/COC_KEY`),
    ]);

    yield * E.succeed(param);
});

export const SSM_PROVIDER = fromParameterStore();

export const thing = pipe(
    prog,
    E.provide(L.setConfigProvider(SSM_PROVIDER)),
);
