import {makeLambda} from '@effect-aws/lambda';
import {Cfg, Logger, pipe} from '#src/utils/effect.ts';
import {DiscordConfig, DiscordRESTLive, MemoryRateLimitStoreLive} from 'dfx';
import {Layer} from 'effect';
import {layerWithoutAgent, makeAgentLayer} from '@effect/platform-node/NodeHttpClient';
import {fromParameterStore} from '@effect-aws/ssm';
import {REDACTED_DISCORD_BOT_TOKEN} from '#src/constants/secrets.ts';
import {slash} from '#src/aws-lambdas/slash/slash.ts';
import {DefaultDynamoDBDocumentServiceLayer} from '@effect-aws/lib-dynamodb';
import {ClashLive} from '#src/internals/layers/clash-service.ts';

export const LambdaLayer = pipe(
    DiscordRESTLive,
    Layer.provideMerge(ClashLive),
    Layer.provideMerge(DefaultDynamoDBDocumentServiceLayer),
    Layer.provideMerge(Logger.replace(Logger.defaultLogger, Logger.structuredLogger)),

    Layer.provide(MemoryRateLimitStoreLive),
    Layer.provide(DiscordConfig.layerConfig({token: Cfg.redacted(REDACTED_DISCORD_BOT_TOKEN)})),
    Layer.provide(layerWithoutAgent),
    Layer.provide(makeAgentLayer({
        keepAlive: true,
    })),
    Layer.provide(Layer.setConfigProvider(fromParameterStore())),
);

export const handler = makeLambda(slash, LambdaLayer);
