import {ComponentRouter} from '#src/component-router.tsx';
import {ix_components} from '#src/lambdas/ix_components.ts';
import {DataClient} from '#src/service/DataClient.ts';
import {DiscordLive, LoggingLive} from '#src/layers.ts';
import {LambdaHandler} from '@effect-aws/lambda';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import {pipe} from 'effect/Function';
import * as L from 'effect/Layer';

const layer = pipe(
  L.mergeAll(
    ComponentRouter,
    DataClient.Default,
    // ClashOfClans.Default,
    // ClashKing.Default,
  ),
  L.provideMerge(DynamoDBDocument.defaultLayer),
  L.provideMerge(DiscordLive()),
  L.provideMerge(LoggingLive()),
);

export const handler = LambdaHandler.make({
  handler: ix_components,
  layer  : layer,
});
