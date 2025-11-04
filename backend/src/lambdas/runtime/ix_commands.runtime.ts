import {ComponentRouter} from '#src/component-router.tsx';
import {ix_commands} from '#src/lambdas/ix_commands.ts';
import {ClashKing} from '#src/service/ClashKing.ts';
import {ClashOfClans} from '#src/service/ClashOfClans.ts';
import {DataClient} from '#src/service/DataClient.ts';
import {DiscordLive, LoggingLive} from '#src/layers.ts';
import {Scheduler} from '@effect-aws/client-scheduler';
import {SQS} from '@effect-aws/client-sqs';
import {LambdaHandler} from '@effect-aws/lambda';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import {pipe} from 'effect/Function';
import * as L from 'effect/Layer';

const layer = pipe(
  L.mergeAll(
    ComponentRouter,
    ClashOfClans.Default,
    ClashKing.Default,
    Scheduler.defaultLayer,
    SQS.defaultLayer,
    DataClient.Default,
  ),
  L.provideMerge(DynamoDBDocument.defaultLayer),
  L.provideMerge(DiscordLive()),
  L.provideMerge(LoggingLive()),
);

export const handler = LambdaHandler.make({
  handler: ix_commands,
  layer  : layer,
});
