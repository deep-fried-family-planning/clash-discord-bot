import {Capacity} from '#src/database/arch/Capacity.ts';
import {E, pipe} from '#src/internal/pure/effect';
import type {QueryCommandOutput, ScanCommandOutput} from '@aws-sdk/lib-dynamodb';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';

export class Client extends E.Service<Client>()('deepfryer/Client', {
  effect: E.gen(function* () {
    const dynamoDB = yield* DynamoDBDocument;
    const capacity = yield* Capacity;

    const createItem = (encoded: any) =>
      pipe(
        dynamoDB.put({
          TableName: process.env.DDB_OPERATIONS,
          Item     : encoded,
        }),
        capacity.withEncodedWriteCapacity(encoded),
      );

    const createItems = (items: any[]) =>
      pipe(
        dynamoDB.batchWrite({
          RequestItems: {
            [process.env.DDB_OPERATIONS]: items.map((item) => ({PutRequest: {Item: item}})),
          },
        }),
        capacity.withEncodedWriteCapacity(items),
      );

    const readItem = (key: any, estimate?: number) =>
      pipe(
        dynamoDB.get({
          TableName     : process.env.DDB_OPERATIONS,
          Key           : key,
          ConsistentRead: true,
        }),
        capacity.withEstimatedReadCapacity(estimate),
      );

    const readItems = (ks: any[], estimate?: number) =>
      pipe(
        dynamoDB.batchGet({
          RequestItems: {
            [process.env.DDB_OPERATIONS]: {Keys: ks.map((key) => ({Key: key}))},
          },
        }),
        capacity.withEstimatedReadCapacity(estimate ?? ks.length),
      );

    const updateItem = (key: any, fields: any, estimate?: number) =>
      pipe(
        dynamoDB.update({
          TableName: process.env.DDB_OPERATIONS,
          Key      : key,
        }),
        capacity.withEstimatedWriteCapacity(estimate),
      );

    const updateItems = (ks: any[], estimate?: number) =>
      pipe(
        dynamoDB.update({
          TableName: process.env.DDB_OPERATIONS,
          Key      : {},
        }),
        capacity.withEstimatedWriteCapacity(estimate ?? ks.length),
      );

    const deleteItem = (key: any, estimate?: number) =>
      pipe(
        dynamoDB.delete({
          TableName: process.env.DDB_OPERATIONS,
          Key      : key,
        }),
        capacity.withEstimatedWriteCapacity(estimate),
      );

    const deleteItems = (ks: any[], estimate?: number) =>
      pipe(
        dynamoDB.batchWrite({
          RequestItems: {
            [process.env.DDB_OPERATIONS]: ks.map((key) => ({DeleteRequest: {Key: key}})),
          },
        }),
        capacity.withEstimatedWriteCapacity(estimate ?? ks.length),
      );

    const readPartition = (pk: string, last?: QueryCommandOutput | null) =>
      pipe(
        dynamoDB.query({
          TableName                : process.env.DDB_OPERATIONS,
          ConsistentRead           : true,
          KeyConditionExpression   : 'pk = :pk',
          ExpressionAttributeValues: {':pk': pk},
          ExclusiveStartKey        : last?.LastEvaluatedKey,
        }),
        capacity.partitionedReadUnits,
      );

    const queryPartition = (key: string, last?: QueryCommandOutput, limit?: number) =>
      pipe(
        dynamoDB.query({
          TableName        : process.env.DDB_OPERATIONS,
          Limit            : limit ?? undefined,
          ExclusiveStartKey: last?.LastEvaluatedKey,
        }),
        capacity.partitionedReadUnits,
      );

    const queryIndex = (idx: any, last?: QueryCommandOutput) =>
      pipe(
        dynamoDB.query({
          TableName        : process.env.DDB_OPERATIONS,
          IndexName        : idx.name,
          ExclusiveStartKey: last?.LastEvaluatedKey,
        }),
        capacity.indexedReadUnits,
      );

    const scanIndex = (name: string, last?: ScanCommandOutput) =>
      pipe(
        dynamoDB.scan({
          TableName        : process.env.DDB_OPERATIONS,
          IndexName        : name,
          ExclusiveStartKey: last?.LastEvaluatedKey,
        }),
        capacity.indexedReadUnits,
      );

    return {
      TableName: process.env.DDB_OPERATIONS,
      ...dynamoDB,
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
  dependencies: [DynamoDBDocument.defaultLayer, Capacity.Default],
}) {}
