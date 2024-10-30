import {makeLambda} from '@effect-aws/lambda';
import {Cfg, pipe} from '#src/utils/effect.ts';
import {DiscordConfig, DiscordRESTLive, MemoryRateLimitStoreLive} from 'dfx';
import {Layer} from 'effect';
import {NodeHttpClient} from '@effect/platform-node';
import {fromParameterStore} from '@effect-aws/ssm';
import {REDACTED_DISCORD_BOT_TOKEN} from '#src/constants/secrets.ts';
import {slash} from '#src/aws-lambdas/slash/slash.ts';

const LambdaLayer = pipe(
    DiscordRESTLive,
    Layer.provide(MemoryRateLimitStoreLive),
    Layer.provide(DiscordConfig.layerConfig({token: Cfg.redacted(REDACTED_DISCORD_BOT_TOKEN)})),
    Layer.provide(NodeHttpClient.layer),
    Layer.provide(Layer.setConfigProvider(fromParameterStore())),
);

export const handler = makeLambda(slash, LambdaLayer);
