import type {CacheKey, CompositeKey} from '#src/database/arch/arch.ts';
import {E, pipe} from '#src/internal/pure/effect.ts';
import type {QueryCommandOutput, ScanCommandOutput} from '@aws-sdk/lib-dynamodb';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import {Cache, Chunk, Console, Duration, RateLimiter} from 'effect';

const cacheKey = (key: CompositeKey | Record<string, any>): CacheKey =>
  `${key.pk}/${key.sk}`;

const compKey = (key: CacheKey): CompositeKey => {
  const [pk, sk] = key.split('/');

  return {
    pk,
    sk,
  };
};

type Dynamo = typeof DynamoDBDocument.Service;

const makeGet = (dynamo: Dynamo, TableName: string, ConsistentRead?: boolean) =>
  (Key: CompositeKey) =>
    dynamo.get({
      TableName,
      Key,
      ConsistentRead,
    });

const service = E.gen(function* () {
  const TableName = process.env.DDB_OPERATIONS;
  const readCapacity = 10;
  const writeCapacity = 10;

  const dynamo = yield* DynamoDBDocument;

  const readLimiter = yield* RateLimiter.make({
    limit    : readCapacity,
    interval : Duration.seconds(1),
    algorithm: 'token-bucket',
  });

  const read = (key: string) =>
    pipe(
      dynamo.get({
        TableName,
        ConsistentRead: true,
        Key           : compKey(key),
      }),
      readLimiter,
      E.flatMap((res) => E.fromNullable(res.Item)),
    );

  const readPartition = (pk: string) =>
    pipe(
      E.loop({done: null as null | QueryCommandOutput}, {
        discard: false,
        while  : (res) => !res.done || !!res.done?.LastEvaluatedKey,
        step   : (res) => res,
        body   : (res) => {
          if (!res.done) {
            return pipe(
              dynamo.query({
                TableName,
                ConsistentRead           : true,
                KeyConditionExpression   : 'pk = :pk',
                ExpressionAttributeValues: {':pk': pk},
              }),
              readLimiter,
              RateLimiter.withCost(readCapacity / 2),
              E.tap((r) => res.done = r),
            );
          }
          if (res.done.LastEvaluatedKey) {
            return pipe(
              dynamo.query({
                TableName,
                ConsistentRead           : true,
                KeyConditionExpression   : 'pk = :pk',
                ExpressionAttributeValues: {':pk': pk},
                ExclusiveStartKey        : res.done.LastEvaluatedKey,
              }),
              readLimiter,
              RateLimiter.withCost(readCapacity / 2),
              E.tap((r) => res.done = r),
            );
          }
          return E.succeed(res.done);
        },
      }),
      E.map((rs) =>
        rs.flatMap((res) => res.Items ?? []),
      ),
    );

  const scanIndex = (key: string) =>
    pipe(
      E.loop({done: null as null | ScanCommandOutput}, {
        discard: false,
        while  : (c) => c.done === null || !!c.done?.LastEvaluatedKey,
        step   : (c) => c,
        body   : (c) => {
          if (!c.done) {
            return pipe(
              dynamo.scan({
                TableName,
                IndexName: key,
              }),
              readLimiter,
              RateLimiter.withCost(readCapacity / 2),
              E.tap((r) => c.done = r),
            );
          }
          if (c.done.LastEvaluatedKey) {
            return pipe(
              dynamo.scan({
                TableName,
                IndexName        : key,
                ExclusiveStartKey: c.done.LastEvaluatedKey,
              }),
              readLimiter,
              RateLimiter.withCost(readCapacity / 2),
              E.tap((r) => c.done = r),
            );
          }
          return E.succeed(c.done);
        },
      }),
      E.map((rs) =>
        rs.flatMap((res) => res.Items ?? []),
      ),
    );

  const Items = yield* Cache.make({
    capacity  : 10000,
    timeToLive: Duration.minutes(3),
    lookup    : read,
  });

  const Partitions = yield* Cache.make({
    capacity  : 1000,
    timeToLive: Duration.minutes(3),
    lookup    : readPartition,
  });

  const IndexScans = yield* Cache.make({
    capacity  : 10,
    timeToLive: Duration.minutes(3),
    lookup    : scanIndex,
  });

  const cachedRead = (key: CompositeKey) =>
    Items.get(cacheKey(key));

  const cachedReadPartition = (pk: string) =>
    pipe(
      Partitions.get(pk),
      E.tap((items) =>
        pipe(
          E.forEach(items, (item) => Items.set(cacheKey(item), item)),
          E.fork,
        ),
      ),
    );

  const cachedScanIndex = (key: string) =>
    pipe(
      IndexScans.get(key),
      E.tap((items) =>
        pipe(
          E.forEach(items, (item) => Items.set(cacheKey(item), item)),
          E.fork,
        ),
      ),
    );

  const cachedReadIndex = (gsi: any, expression: any) => {
    const KeyConditionExpressionMap = {} as any;
    const ExpressionAttributeValues = {} as any;

    for (const [key, value] of Object.entries(expression)) {
      KeyConditionExpressionMap[key] = `:${key}`;
      ExpressionAttributeValues[`:${key}`] = value;
    }

    const KeyConditionExpression = Object
      .entries(KeyConditionExpressionMap)
      .reduce((acc, [k, v]) => {
        acc += `${k} = ${v} AND `;
        return acc;
      }, '')
      .slice(0, -5);

    return pipe(
      dynamo.query({
        TableName,
        IndexName: gsi.name,
        KeyConditionExpression,
        ExpressionAttributeValues,
      }),
      E.flatMap((res) => E.fromNullable(res.Items)),
      E.tap((res) =>
        pipe(
          E.forEach(res, (r) => Items.set(cacheKey(r), r)),
          E.fork,
        ),
      ),
    );
  };

  const writeLimiter = yield* RateLimiter.make({
    limit    : writeCapacity,
    interval : Duration.seconds(1),
    algorithm: 'token-bucket',
  });

  const cachedSave = (item: CompositeKey | Record<string, any>) =>
    pipe(
      dynamo.put({
        TableName,
        Item: item,
      }),
      writeLimiter,
      E.tap(() => Items.set(cacheKey(item), item)),
      E.tap(() => Partitions.invalidate(item.pk)),
      E.tap(() => IndexScans.invalidateAll),
    );

  const cachedErase = (key: CompositeKey) =>
    pipe(
      dynamo.delete({
        TableName,
        Key: key,
      }),
      writeLimiter,
      E.tap(() => Items.invalidate(cacheKey(key))),
      E.tap(() => Partitions.invalidate(key.pk)),
      E.tap(() => IndexScans.invalidateAll),
    );

  const cachedUpdate = (key: CompositeKey, update: Record<string, any>) =>
    pipe(
      dynamo.update({
        TableName,
        Key                     : key,
        UpdateExpression        : 'set #attr = :attr',
        ExpressionAttributeNames: {
          '#attr': 'attr',
        },
        ExpressionAttributeValues: {
          ':attr': update.attr,
        },
      }),
    );

  const batchedCachedRead = (items: CompositeKey[]) =>
    pipe(
      Chunk.fromIterable(items),
      Chunk.chunksOf(readCapacity),
      Chunk.map((cs) =>
        pipe(
          dynamo.batchGet({
            RequestItems: {
              [TableName]: {
                ConsistentRead: true,
                Keys          : Chunk.toArray(cs),
              },
            },
          }),
          readLimiter,
          RateLimiter.withCost(cs.length),
          E.flatMap((res) => E.fromNullable(res.Responses?.[TableName])),
          E.tap((items) =>
            pipe(
              E.forEach(items, (item) => Items.set(cacheKey(item), item)),
              E.fork,
            ),
          ),
        ),
      ),
      Chunk.toArray,
      E.allWith({concurrency: 'unbounded'}),
    );

  const batchedCachedSave = (items: CompositeKey[]) =>
    pipe(
      Chunk.fromIterable(items),
      Chunk.chunksOf(writeCapacity),
      Chunk.map((cs) =>
        pipe(
          dynamo.batchWrite({
            RequestItems: {
              [TableName]: Chunk.toArray(cs).map((item) =>
                ({
                  PutRequest: {
                    TableName,
                    Item: item,
                  },
                }),
              ),
            },
          }),
          writeLimiter,
          RateLimiter.withCost(cs.length),
          E.tap(() =>
            E.forEach(Chunk.toArray(cs), (item) =>
              pipe(
                E.void,
                E.tap(() => Items.invalidate(cacheKey(item))),
                E.tap(() => Partitions.invalidate(item.pk)),
                E.tap(() => IndexScans.invalidateAll),
              ),
            ),
          ),
        ),
      ),
      Chunk.toArray,
      E.allWith({concurrency: 'unbounded'}),
    );

  const batchedCachedErase = (items: CompositeKey[]) =>
    pipe(
      Chunk.fromIterable(items),
      Chunk.chunksOf(writeCapacity),
      Chunk.map((cs) =>
        pipe(
          dynamo.batchWrite({
            RequestItems: {
              [TableName]: Chunk.toArray(cs).map((item) =>
                ({
                  DeleteRequest: {
                    TableName,
                    Key: item,
                  },
                }),
              ),
            },
          }),
          writeLimiter,
          RateLimiter.withCost(cs.length),
          E.tap(() =>
            E.forEach(Chunk.toArray(cs), (item) =>
              pipe(
                E.void,
                E.tap(() => Items.invalidate(cacheKey(item))),
                E.tap(() => Partitions.invalidate(item.pk)),
                E.tap(() => IndexScans.invalidateAll),
              ),
            ),
          ),
        ),
      ),
      Chunk.toArray,
      E.allWith({concurrency: 'unbounded'}),
    );

  return {
    ...dynamo,
    Items,
    Partitions,
    TableName,
    read,
    readPartition,
    scanIndex,
    cachedRead,
    cachedReadPartition,
    cachedScanIndex,
    cachedReadIndex,
    cachedSave: (...p: any) => E.log(p),
    cachedErase,
    batchedCachedRead,
    batchedCachedSave,
    batchedCachedErase,
  };
});

export class DatabaseDriver extends E.Service<DatabaseDriver>()('deepfryer/DatabaseDriver', {
  scoped      : service,
  dependencies: [DynamoDBDocument.defaultLayer],
  accessors   : true,
}) {}
