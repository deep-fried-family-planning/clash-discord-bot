import {DynamoLimiter} from '#src/database/arch/DynamoLimiter.ts';
import type {KeyItem} from '#src/database/data-arch/codec-key-item.ts';
import {E, pipe} from '#src/internal/pure/effect.ts';
import type {QueryCommandOutput, ScanCommandOutput} from '@aws-sdk/lib-dynamodb';
import type * as DynamoErrors from '@effect-aws/client-dynamodb/Errors';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import {Data, identity} from 'effect';
import type {TimeoutException} from 'effect/Cause';

export class DynamoClientError extends Data.TaggedError('DynamoClientError')<{
  cause?: | TimeoutException
          | DynamoErrors.SdkError
          | DynamoErrors.ConditionalCheckFailedError
          | DynamoErrors.InternalServerError
          | DynamoErrors.InvalidEndpointError
          | DynamoErrors.ItemCollectionSizeLimitExceededError
          | DynamoErrors.ProvisionedThroughputExceededError
          | DynamoErrors.RequestLimitExceededError
          | DynamoErrors.ResourceNotFoundError
          | DynamoErrors.TransactionConflictError;
}> {}

export class UnprocessedItemsError extends Data.TaggedError('UnprocessedItemsError')<{
  items: unknown[];
}> {}

export class DynamoClient extends E.Service<DynamoClient>()('deepfryer/DynamoClient', {
  effect: E.gen(function* () {
    const {_, ...dynamo} = yield* DynamoDBDocument;
    const limiter = yield* DynamoLimiter;

    const createItem = (encoded: any) =>
      pipe(
        dynamo.put({
          TableName: process.env.DDB_OPERATIONS,
          Item     : encoded,
        }),
        limiter.encodedWriteUnits(encoded),
        E.catchAll((e) => new DynamoClientError({cause: e})),
        E.asVoid,
      );

    const createItems = (items: any[]) =>
      pipe(
        dynamo.batchWrite({
          RequestItems: {
            [process.env.DDB_OPERATIONS]: items.map((item) => ({PutRequest: {Item: item}})),
          },
        }),
        limiter.encodedWriteUnits(items),
        E.catchAll((e) => new DynamoClientError({cause: e})),
        E.tap((res) => {
          const unprocessed = res.UnprocessedItems?.[process.env.DDB_OPERATIONS];

          return !unprocessed?.length
            ? E.void
            : new UnprocessedItemsError({items: unprocessed});
        }),
        E.asVoid,
      );

    const readItem = (key: any, estimate?: number) =>
      pipe(
        dynamo.get({
          TableName     : process.env.DDB_OPERATIONS,
          Key           : key,
          ConsistentRead: true,
        }),
        limiter.estimateReadUnits(estimate),
        E.catchAll((e) => new DynamoClientError({cause: e})),
        E.flatMap((res) => E.fromNullable(res.Item as KeyItem.Item)),
      );

    const readItems = (ks: any[], estimate?: number) =>
      pipe(
        dynamo.batchGet({
          RequestItems: {
            [process.env.DDB_OPERATIONS]: {Keys: ks.map((key) => ({Key: key}))},
          },
        }),
        limiter.estimateReadUnits(estimate ?? ks.length),
        E.catchAll((e) => new DynamoClientError({cause: e})),
        E.tap((res) => {
          const unprocessed = res.UnprocessedKeys?.[process.env.DDB_OPERATIONS]?.Keys;

          return !unprocessed?.length
            ? E.void
            : new UnprocessedItemsError({items: unprocessed});
        }),
        E.asVoid,
      );

    const updateItem = (key: any, expression: any, values: any, estimate?: number) =>
      pipe(
        dynamo.update({
          TableName                : process.env.DDB_OPERATIONS,
          Key                      : key,
          UpdateExpression         : expression,
          ExpressionAttributeValues: values,
        }),
        limiter.estimateWriteUnits(estimate),
        E.catchAll((e) => new DynamoClientError({cause: e})),
        E.asVoid,
      );

    const deleteItem = (key: any, estimate?: number) =>
      pipe(
        dynamo.delete({
          TableName: process.env.DDB_OPERATIONS,
          Key      : key,
        }),
        limiter.estimateWriteUnits(estimate),
        E.catchAll((e) => new DynamoClientError({cause: e})),
        E.asVoid,
      );

    const deleteItems = (ks: any[], estimate?: number) =>
      pipe(
        dynamo.batchWrite({
          RequestItems: {
            [process.env.DDB_OPERATIONS]: ks.map((key) => ({DeleteRequest: {Key: key}})),
          },
        }),
        limiter.estimateWriteUnits(estimate ?? ks.length),
        E.catchAll((e) => new DynamoClientError({cause: e})),
        E.tap((res) => {
          const unprocessed = res.UnprocessedItems?.[process.env.DDB_OPERATIONS];

          return !unprocessed?.length
            ? E.void
            : new UnprocessedItemsError({items: unprocessed});
        }),
        E.asVoid,
      );

    const scanPartition = (pk: string, last?: QueryCommandOutput | null) =>
      pipe(
        dynamo.query({
          TableName                : process.env.DDB_OPERATIONS,
          ConsistentRead           : true,
          KeyConditionExpression   : 'pk = :pk',
          ExpressionAttributeValues: {':pk': pk},
          ExclusiveStartKey        : last?.LastEvaluatedKey,
        }),
        limiter.partitionReadUnits,
        E.catchAll((e) => new DynamoClientError({cause: e})),
      );

    const scanPartitionEntirely = (pk: string) =>
      pipe(
        E.loop({done: null as null | QueryCommandOutput}, {
          step : identity,
          while: (c) => !c.done || !!c.done?.LastEvaluatedKey,
          body : (c) =>
            pipe(
              scanPartition(pk, c.done),
              E.map((res) => {
                c.done = res;
                return res.Items ?? [];
              }),
            ),
        }),
        E.map((cs) => cs.flat() as KeyItem.Item[]),
      );

    const queryPartition = (condition: string, values: any, limit?: number, last?: QueryCommandOutput | null) =>
      pipe(
        dynamo.query({
          TableName                : process.env.DDB_OPERATIONS,
          Limit                    : limit ?? undefined,
          KeyConditionExpression   : condition,
          ExpressionAttributeValues: values,
          ExclusiveStartKey        : last?.LastEvaluatedKey,
        }),
        limiter.partitionReadUnits,
        E.catchAll((e) => new DynamoClientError({cause: e})),
      );

    const queryPartitionEntirely = (condition: string, values: any, limit?: number) =>
      pipe(
        E.loop({done: null as null | QueryCommandOutput}, {
          step : identity,
          while: (c) => !c.done || !!c.done?.LastEvaluatedKey,
          body : (c) =>
            pipe(
              queryPartition(condition, values, limit, c.done),
              E.map((res) => {
                c.done = res;
                return res.Items ?? [];
              }),
            ),
        }),
        E.map((cs) => cs.flat() as KeyItem.Item[]),
      );

    const queryIndex = (index: string, condition: string, values: any, limit?: number, last?: QueryCommandOutput | null) =>
      pipe(
        dynamo.query({
          TableName                : process.env.DDB_OPERATIONS,
          IndexName                : index,
          Limit                    : limit ?? undefined,
          KeyConditionExpression   : condition,
          ExpressionAttributeValues: values,
          ExclusiveStartKey        : last?.LastEvaluatedKey,
        }),
        limiter.partitionReadUnits,
        E.catchAll((e) => new DynamoClientError({cause: e})),
      );

    const queryIndexEntirely = (index: string, condition: string, values: any, limit?: number) =>
      pipe(
        E.loop({done: null as null | QueryCommandOutput}, {
          step : identity,
          while: (c) => !c.done || !!c.done?.LastEvaluatedKey,
          body : (c) =>
            pipe(
              queryIndex(index, condition, values, limit, c.done),
              E.map((res) => {
                c.done = res;
                return res.Items ?? [];
              }),
            ),
        }),
        E.map((cs) => cs.flat() as KeyItem.Item[]),
      );

    const scanIndex = (name: string, last?: ScanCommandOutput) =>
      pipe(
        dynamo.scan({
          TableName        : process.env.DDB_OPERATIONS,
          IndexName        : name,
          ExclusiveStartKey: last?.LastEvaluatedKey,
        }),
        limiter.indexReadUnits,
        E.catchAll((e) => new DynamoClientError({cause: e})),
      );

    const scanIndexEntirely = (name: string) =>
      pipe(
        E.loop({done: null as null | ScanCommandOutput}, {
          step : identity,
          while: (c) => c.done === null || !!c.done?.LastEvaluatedKey,
          body : (c) =>
            pipe(
              scanIndex(name),
              E.map((res) => {
                c.done = res;
                return res.Items ?? [];
              }),
            ),
        }),
        E.map((rs) => rs.flat() as KeyItem.Item[]),
      );

    const scanIndexEntirelyWith = (name: string) => <A, E, R>(fn: (items: any[]) => E.Effect<A, E, R>) =>
      pipe(
        E.loop({done: null as null | ScanCommandOutput}, {
          step : identity,
          while: (c) => c.done === null || !!c.done?.LastEvaluatedKey,
          body : (c) =>
            pipe(
              scanIndex(name),
              E.map((res) => {
                c.done = res;
                return res.Items ?? [];
              }),
              E.tap((items) => fn(items)),
            ),
        }),
        E.map((rs) => rs.flat() as KeyItem.Item[]),
      );

    return {
      limiter,
      TableName: process.env.DDB_OPERATIONS,
      ...dynamo,
      createItem,
      createItems,
      readItem,
      readItems,
      updateItem,
      deleteItem,
      deleteItems,
      scanPartition,
      scanPartitionEntirely,
      queryPartition,
      queryPartitionEntirely,
      queryIndex,
      queryIndexEntirely,
      scanIndex,
      scanIndexEntirely,
      scanIndexEntirelyWith,
    };
  }),
  dependencies: [DynamoDBDocument.defaultLayer, DynamoLimiter.Default],
}) {}
