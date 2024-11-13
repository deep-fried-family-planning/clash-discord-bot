import {makeLambda} from '@effect-aws/lambda';
import {Cfg, DT, L, Logger, pipe} from '#src/internals/re-exports/effect.ts';
import {DiscordConfig, DiscordRESTMemoryLive} from 'dfx';
import {NodeHttpClient} from '@effect/platform-node';
import {fromParameterStore} from '@effect-aws/ssm';
import {REDACTED_DISCORD_BOT_TOKEN} from '#src/internals/constants/secrets.ts';
import {slash} from '#src/aws-lambdas/discord_slash/slash.ts';
import {Clashofclans} from '#src/internals/layer-api/clashofclans.ts';
import {Clashking} from '#src/internals/layer-api/clashking.ts';
import {DynamoDBDocumentService} from '@effect-aws/lib-dynamodb';
import {SQSService} from '@effect-aws/client-sqs';
import {SchedulerService} from '@effect-aws/client-scheduler';
import {DiscordApi} from '#src/internals/layer-api/discord-api.ts';

export const LambdaLayer = pipe(
    DiscordApi.Live,
    L.provideMerge(Clashofclans.Live),
    L.provideMerge(Clashking.Live),
    L.provideMerge(DT.layerCurrentZoneLocal),
    L.provideMerge(SchedulerService.defaultLayer),
    L.provideMerge(SQSService.defaultLayer),
    L.provideMerge(DynamoDBDocumentService.defaultLayer),
    L.provideMerge(DiscordRESTMemoryLive),
    L.provide(DiscordConfig.layerConfig({token: Cfg.redacted(REDACTED_DISCORD_BOT_TOKEN)})),
    L.provide(NodeHttpClient.layerUndici),
    L.provide(L.setConfigProvider(fromParameterStore())),
    L.provide(Logger.replace(Logger.defaultLogger, Logger.structuredLogger)),
);

export const handler = makeLambda(slash, LambdaLayer);
