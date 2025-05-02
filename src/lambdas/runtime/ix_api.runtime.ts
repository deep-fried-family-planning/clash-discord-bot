import {DiscordRESTEnv} from 'config/external.ts';
import {L} from '#src/internal/pure/effect.ts';
import {ix_api} from '#src/lambdas/ix_api.ts';
import {DeepFryerLogger} from '#src/service/DeepFryerLogger.ts';
import {EventRouterLive} from '#src/service/EventRouter.ts';
import {InteractionVerify} from '#src/service/InteractionVerify.ts';
import {LambdaHandler} from '@effect-aws/lambda';
import {NodeHttpClient} from '@effect/platform-node';
import {DiscordConfig, DiscordRESTMemoryLive} from 'dfx';
import {Layer} from 'effect';

const layer = Layer.mergeAll(
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
