import {ix_api} from '#src/lambdas/ix_api.ts';
import {EventRouterLive} from '#src/service/EventRouter.ts';
import {InteractionVerify} from '#src/service/InteractionVerify.ts';
import {DiscordLive, LoggingLive} from '#src/layers.ts';
import {LambdaHandler} from '@effect-aws/lambda';
import {pipe} from 'effect/Function';
import * as L from 'effect/Layer';

const layer = pipe(
  L.mergeAll(
    EventRouterLive(),
    InteractionVerify.Default,
  ),
  L.provideMerge(DiscordLive()),
  L.provideMerge(LoggingLive()),
);

export const handler = LambdaHandler.make({
  handler: ix_api,
  layer  : layer,
});
