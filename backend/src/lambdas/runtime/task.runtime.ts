import {task} from '#src/lambdas/task.ts';
import {ClashOfClans} from '#src/service/ClashOfClans.ts';
import {EventRouterLive} from '#src/service/EventRouter.ts';
import {DiscordLive, LoggingLive} from '#src/layers.ts';
import {LambdaHandler} from '@effect-aws/lambda';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import {pipe} from 'effect/Function';
import * as L from 'effect/Layer';

const layer = pipe(
  L.mergeAll(
    EventRouterLive(),
    ClashOfClans.Default,
  ),
  L.provideMerge(DynamoDBDocument.defaultLayer),
  L.provideMerge(DiscordLive()),
  L.provideMerge(LoggingLive()),
);

export const handler = LambdaHandler.make({
  handler: task,
  layer  : layer,
});
