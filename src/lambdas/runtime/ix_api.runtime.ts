import {DiscordRESTEnv} from '#config/external.ts';
import {ix_api} from '#src/lambdas/ix_api.ts';
import {makeLambdaRuntime} from '#src/lambdas/util.ts';
import {DeepFryerLogger} from '#src/service/DeepFryerLogger.ts';
import {DiscordVerifyLive} from '#src/service/InteractionVerify.ts';
import {EventRouterLive} from '#src/service/EventRouter.ts';
import {NodeHttpClient} from '@effect/platform-node';
import type {APIGatewayProxyEventBase} from 'aws-lambda';
import {DiscordConfig, DiscordRESTMemoryLive} from 'dfx';
import {Layer} from 'effect';

const runtime = makeLambdaRuntime(
  Layer.mergeAll(
    EventRouterLive,
    DiscordVerifyLive,
    DeepFryerLogger.Default.pipe(
      Layer.provide(DiscordRESTMemoryLive),
      Layer.provide(NodeHttpClient.layer),
      Layer.provide(DiscordConfig.layerConfig(DiscordRESTEnv)),
    ),
  ),
);

export const handler = async (req: APIGatewayProxyEventBase<any>) => await runtime(
  ix_api(req),
);
