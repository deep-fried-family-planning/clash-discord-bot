import {Client} from '#src/database/arch/Client.ts';
import type {CacheKey, CompositeKey} from '#src/database/setup/arch.ts';
import {E, pipe} from '#src/internal/pure/effect.ts';
import type {QueryCommandOutput, ScanCommandOutput} from '@aws-sdk/lib-dynamodb';
import {Cache, Chunk, Duration, identity} from 'effect';

const cacheKey = (key: CompositeKey | Record<string, any>): CacheKey =>
  `${key.pk}/${key.sk}`;

const compKey = (key: CacheKey): CompositeKey => {
  const [pk, sk] = key.split('/');

  return {
    pk,
    sk,
  };
};

export class Database extends E.Service<Database>()('deepfryer/Database', {
  effect: E.gen(function* () {
    const client = yield* Client;
    const {TableName} = client;

    const lookupItem = (key: string) =>
      pipe(
        client.readItem(compKey(key)),
        E.flatMap((res) => E.fromNullable(res.Item)),
      );

    const lookupPartition = (pk: string) =>
      pipe(
        E.loop({done: null as null | QueryCommandOutput}, {
          step : identity,
          while: (c) => !c.done || !!c.done?.LastEvaluatedKey,
          body : (c) =>
            pipe(
              client.readPartition(pk, c.done),
              E.map((res) => {
                c.done = res;
                return res.Items ?? [];
              }),
            ),
        }),
        E.map((cs) => cs.flat()),
      );

    const lookupIndex = (key: string) =>
      pipe(
        E.loop({done: null as null | ScanCommandOutput}, {
          step : identity,
          while: (c) => c.done === null || !!c.done?.LastEvaluatedKey,
          body : (c) =>
            pipe(
              client.scan({
                TableName        : client.TableName,
                IndexName        : key,
                ExclusiveStartKey: c.done?.LastEvaluatedKey,
              }),
              E.map((res) => {
                c.done = res;
                return res.Items ?? [];
              }),
            ),
        }),
        E.map((rs) => rs.flat()),
      );

    const Items = yield* Cache.make({
      capacity  : 10000,
      timeToLive: Duration.minutes(3),
      lookup    : lookupItem,
    });

    const Partitions = yield* Cache.make({
      capacity  : 1000,
      timeToLive: Duration.minutes(3),
      lookup    : lookupPartition,
    });

    const IndexScans = yield* Cache.make({
      capacity  : 10,
      timeToLive: Duration.minutes(3),
      lookup    : lookupIndex,
    });

    const createItem = (item: CompositeKey | Record<string, any>) =>
      pipe(
        client.createItem(item),
        E.tap(Items.set(cacheKey(item), item)),
        E.tap(Partitions.invalidate(item.pk)),
      );

    const createItems = (items: (CompositeKey | Record<string, any>)[]) =>
      pipe(
        client.createItems(items),
        E.tap(
          pipe(
            E.forEach(items, (item) =>
              E.all([
                Items.set(cacheKey(item), item),
                Partitions.invalidate(item.pk),
              ]),
            ),
            E.fork,
          ),
        ),
      );

    const readItem = (key: CompositeKey) =>
      Items.get(cacheKey(key));

    const readItems = (keys: CompositeKey[]) =>
      pipe(
        client.readItems(keys),
        E.map((res) => res.Responses![TableName]),
        E.tap((items) =>
          E.fork(
            E.forEach(items, (item) => Items.set(cacheKey(item), item)),
          ),
        ),
      );

    const readPartition = (pk: string) =>
      pipe(
        Partitions.get(pk),
        E.tap((items) =>
          E.fork(
            E.forEach(items, (item) => Items.set(cacheKey(item), item)),
          ),
        ),
      );

    const readIndex = (key: string) =>
      pipe(
        IndexScans.get(key),
        E.tap((items) =>
          E.fork(
            E.forEach(items, (item) => Items.set(cacheKey(item), item)),
          ),
        ),
      );

    const updateItem = (key: CompositeKey, update: Record<string, any>) =>
      pipe(
        client.update({
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

    const deleteItem = (key: CompositeKey) =>
      pipe(
        client.deleteItem(key),
        E.tap(Items.invalidate(cacheKey(key))),
        E.tap(Partitions.invalidate(key.pk)),
        E.tap(IndexScans.invalidateAll),
      );

    const deleteItems = (keys: CompositeKey[]) =>
      pipe(
        client.deleteItems(keys),
        E.tap(
          E.fork(
            E.forEach(keys, (key) =>
              E.all([
                Items.invalidate(cacheKey(key)),
                Partitions.invalidate(key.pk),
              ]),
            ),
          ),
        ),
        E.tap(IndexScans.invalidateAll),
      );

    return {
      client,
      Items,
      Partitions,
      TableName,
      createItem: (...p: any) => E.log('createItem', p),
      createItems,
      readItem,
      readItems,
      readPartition,
      readIndex,
      updateItem,
      deleteItem,
      deleteItems,
      lookupItem,
      lookupPartition,
      lookupIndex,
    };
  }),
  dependencies: [Client.Default],
  accessors   : true,
}) {}

// const readIndex = (gsi: any, expression: any) => {
//   const KeyConditionExpressionMap = {} as any;
//   const ExpressionAttributeValues = {} as any;
//
//   for (const [key, value] of Object.entries(expression)) {
//     KeyConditionExpressionMap[key] = `:${key}`;
//     ExpressionAttributeValues[`:${key}`] = value;
//   }
//
//   const KeyConditionExpression = Object
//     .entries(KeyConditionExpressionMap)
//     .reduce((acc, [k, v]) => {
//       acc += `${k} = ${v} AND `;
//       return acc;
//     }, '')
//     .slice(0, -5);
//
//   return pipe(
//     client.query({
//       TableName: client.TableName,
//       IndexName: gsi.name,
//       KeyConditionExpression,
//       ExpressionAttributeValues,
//     }),
//     E.flatMap((res) => E.fromNullable(res.Items)),
//     E.tap((res) =>
//       pipe(
//         E.forEach(res, (r) => Items.set(cacheKey(r), r)),
//         E.fork,
//       ),
//     ),
//   );
// };
