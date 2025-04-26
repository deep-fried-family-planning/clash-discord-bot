import {DbLimiter} from '#src/database/arch/DbLimiter.ts';
import {E, pipe} from '#src/internal/pure/effect';
import type {QueryCommandOutput, ScanCommandOutput} from '@aws-sdk/lib-dynamodb';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import {Data} from 'effect';

export class DbClientError extends Data.TaggedError('deepfryer/DbClientError')<{}> {}

export class DbClient extends E.Service<DbClient>()('deepfryer/DbClient', {
  effect: E.gen(function* () {
    const dynamo = yield* DynamoDBDocument;
    const limiter = yield* DbLimiter;

    const createItem = (encoded: any) =>
      pipe(
        dynamo.put({
          TableName: process.env.DDB_OPERATIONS,
          Item     : encoded,
        }),
        limiter.encodedWriteUnits(encoded),
      );

    const createItems = (items: any[]) =>
      pipe(
        dynamo.batchWrite({
          RequestItems: {
            [process.env.DDB_OPERATIONS]: items.map((item) => ({PutRequest: {Item: item}})),
          },
        }),
        limiter.encodedWriteUnits(items),
      );

    const readItem = (key: any, estimate?: number) =>
      pipe(
        dynamo.get({
          TableName     : process.env.DDB_OPERATIONS,
          Key           : key,
          ConsistentRead: true,
        }),
        limiter.estimateReadUnits(estimate),
      );

    const readItems = (ks: any[], estimate?: number) =>
      pipe(
        dynamo.batchGet({
          RequestItems: {
            [process.env.DDB_OPERATIONS]: {Keys: ks.map((key) => ({Key: key}))},
          },
        }),
        limiter.estimateReadUnits(estimate ?? ks.length),
      );

    const updateItem = (key: any, fields: any, estimate?: number) =>
      pipe(
        dynamo.update({
          TableName: process.env.DDB_OPERATIONS,
          Key      : key,
        }),
        limiter.estimateWriteUnits(estimate),
      );

    const updateItems = (ks: any[], estimate?: number) =>
      pipe(
        dynamo.update({
          TableName: process.env.DDB_OPERATIONS,
          Key      : {},
        }),
        limiter.estimateWriteUnits(estimate ?? ks.length),
      );

    const deleteItem = (key: any, estimate?: number) =>
      pipe(
        dynamo.delete({
          TableName: process.env.DDB_OPERATIONS,
          Key      : key,
        }),
        limiter.estimateWriteUnits(estimate),
      );

    const deleteItems = (ks: any[], estimate?: number) =>
      pipe(
        dynamo.batchWrite({
          RequestItems: {
            [process.env.DDB_OPERATIONS]: ks.map((key) => ({DeleteRequest: {Key: key}})),
          },
        }),
        limiter.estimateWriteUnits(estimate ?? ks.length),
      );

    const readPartition = (pk: string, last?: QueryCommandOutput | null) =>
      pipe(
        dynamo.query({
          TableName                : process.env.DDB_OPERATIONS,
          ConsistentRead           : true,
          KeyConditionExpression   : 'pk = :pk',
          ExpressionAttributeValues: {':pk': pk},
          ExclusiveStartKey        : last?.LastEvaluatedKey,
        }),
        limiter.partitionReadUnits,
      );

    const queryPartition = (key: string, last?: QueryCommandOutput, limit?: number) =>
      pipe(
        dynamo.query({
          TableName        : process.env.DDB_OPERATIONS,
          Limit            : limit ?? undefined,
          ExclusiveStartKey: last?.LastEvaluatedKey,
        }),
        limiter.partitionReadUnits,
      );

    const queryIndex = (idx: any, last?: QueryCommandOutput) =>
      pipe(
        dynamo.query({
          TableName        : process.env.DDB_OPERATIONS,
          IndexName        : idx.name,
          ExclusiveStartKey: last?.LastEvaluatedKey,
        }),
        limiter.indexReadUnits,
      );

    const scanIndex = (name: string, last?: ScanCommandOutput) =>
      pipe(
        dynamo.scan({
          TableName        : process.env.DDB_OPERATIONS,
          IndexName        : name,
          ExclusiveStartKey: last?.LastEvaluatedKey,
        }),
        limiter.indexReadUnits,
      );

    return {
      limiter,
      TableName: process.env.DDB_OPERATIONS,
      ...dynamo,
      createItem,
      readItem,
      updateItem,
      updateItems,
      deleteItem,
      createItems,
      readItems,
      deleteItems,
      readPartition,
      queryPartition,
      queryIndex,
      scanIndex,
    };
  }),
  dependencies: [DynamoDBDocument.defaultLayer, DbLimiter.Default],
}) {}
