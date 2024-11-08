import {makeLambda} from '@effect-aws/lambda';
import {Cfg, L, Logger, pipe} from '#src/internals/re-exports/effect.ts';
import {DiscordConfig, DiscordRESTLive, MemoryRateLimitStoreLive} from 'dfx';
import {layerWithoutAgent, makeAgentLayer} from '@effect/platform-node/NodeHttpClient';
import {fromParameterStore} from '@effect-aws/ssm';
import {REDACTED_DISCORD_BOT_TOKEN} from '#src/internals/constants/secrets.ts';
import {slash} from '#src/aws-lambdas/slash/slash.ts';
import {DefaultDynamoDBDocumentServiceLayer} from '@effect-aws/lib-dynamodb';
import {ClashLive} from '#src/internals/layers/clash-service.ts';

export const LambdaLayer = pipe(
    DiscordRESTLive,
    L.provideMerge(ClashLive),
    L.provideMerge(DefaultDynamoDBDocumentServiceLayer),
    L.provideMerge(Logger.replace(Logger.defaultLogger, Logger.structuredLogger)),
    L.provide(MemoryRateLimitStoreLive),
    L.provide(DiscordConfig.layerConfig({token: Cfg.redacted(REDACTED_DISCORD_BOT_TOKEN)})),
    L.provide(layerWithoutAgent),
    L.provide(makeAgentLayer({keepAlive: true})),
    L.provide(L.setConfigProvider(fromParameterStore())),
);

export const handler = makeLambda(slash, LambdaLayer);
