import {makeLambda} from '@effect-aws/lambda';
import {Cfg, L, Logger, pipe} from '#src/internals/re-exports/effect.ts';
import {DiscordConfig, DiscordRESTMemoryLive} from 'dfx';
import {NodeHttpClient} from '@effect/platform-node';
import {fromParameterStore} from '@effect-aws/ssm';
import {REDACTED_DISCORD_BOT_TOKEN} from '#src/internals/constants/secrets.ts';
import {slash} from '#src/aws-lambdas/slash/slash.ts';
import {DefaultDynamoDBDocumentServiceLayer} from '@effect-aws/lib-dynamodb';
import {ClashPerkServiceLive} from '#src/internals/layers/clashperk-service.ts';
import {ClashkingServiceLive} from '#src/internals/layers/clashking-service.ts';

export const LambdaLayer = pipe(
    DiscordRESTMemoryLive,
    L.provideMerge(ClashPerkServiceLive),
    L.provideMerge(ClashkingServiceLive),
    L.provideMerge(DefaultDynamoDBDocumentServiceLayer),
    L.provideMerge(Logger.replace(Logger.defaultLogger, Logger.structuredLogger)),
    L.provide(DiscordConfig.layerConfig({token: Cfg.redacted(REDACTED_DISCORD_BOT_TOKEN)})),
    L.provide(NodeHttpClient.layer),
    L.provide(L.setConfigProvider(fromParameterStore())),
);

export const handler = makeLambda(slash, LambdaLayer);
