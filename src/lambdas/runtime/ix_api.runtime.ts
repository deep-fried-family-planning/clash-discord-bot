import {ix_api} from '#src/lambdas/ix_api.ts';
import {DeepFryerLogger} from '#src/service/DeepFryerLogger.ts';
import {EventRouterLive} from '#src/service/EventRouter.ts';
import {InteractionVerify} from '#src/service/InteractionVerify.ts';
import {LambdaHandler} from '@effect-aws/lambda';
import {NodeHttpClient} from '@effect/platform-node';
import {DiscordRESTEnv} from 'config/external.ts';
import {DiscordConfig, DiscordRESTMemoryLive} from 'dfx';
import * as L from 'effect/Layer';

const layer = L.mergeAll(
  EventRouterLive(),
  InteractionVerify.Default,
  DeepFryerLogger.Default.pipe(
    L.provideMerge(DiscordRESTMemoryLive),
    L.provideMerge(NodeHttpClient.layerUndici),
    L.provideMerge(DiscordConfig.layerConfig(DiscordRESTEnv)),
  ),
);

export const handler = LambdaHandler.make({
  handler: ix_api,
  layer  : layer,
});
