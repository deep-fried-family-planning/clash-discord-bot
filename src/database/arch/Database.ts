import type {CacheKey, CompositeKey} from '#src/database/arch-schema/arch.ts';
import {DbClient} from '#src/database/arch/DbClient.ts';
import {DbMemory} from '#src/database/arch/DbMemory.ts';
import {E} from '#src/internal/pure/effect.ts';
import type {QueryCommandOutput} from '@aws-sdk/lib-dynamodb';
import {identity, pipe} from 'effect';

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
    const {_, _tag, ...client} = yield* DbClient;
    const {TableName} = client;
    const memory = yield* DbMemory;
    const {Items, Partitions, IndexScans} = memory;

    const createItemCached = (item: CompositeKey | Record<string, any>) =>
      pipe(
        client.createItem(item),
        E.tap(Items.set(cacheKey(item), item)),
        E.tap(Partitions.invalidate(item.pk)),
      );

    const createItemsCached = (items: (CompositeKey | Record<string, any>)[]) =>
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

    const readItemCached = (key: CompositeKey) =>
      Items.get(cacheKey(key));

    const readItemsCached = (keys: CompositeKey[]) =>
      pipe(
        client.readItems(keys),
        E.map((res) => res.Responses![TableName]),
        E.tap((items) =>
          E.fork(
            E.forEach(items, (item) => Items.set(cacheKey(item), item)),
          ),
        ),
      );

    const readPartitionCached = (pk: string) =>
      pipe(
        Partitions.get(pk),
        E.tap((items) =>
          E.fork(
            E.forEach(items, (item) => Items.set(cacheKey(item), item)),
          ),
        ),
      );

    const readIndexCached = (idx: string) =>
      pipe(
        IndexScans.get(idx),
        E.tap((items) =>
          E.fork(
            E.forEach(items, (item) => Items.set(cacheKey(item), item)),
          ),
        ),
      );

    const updateItemCached = (key: CompositeKey, update: Record<string, any>) =>
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

    const deleteItemCached = (key: CompositeKey) =>
      pipe(
        client.deleteItem(key),
        E.tap(Items.invalidate(cacheKey(key))),
        E.tap(Partitions.invalidate(key.pk)),
        E.tap(IndexScans.invalidateAll),
      );

    const deleteItemsCached = (keys: CompositeKey[]) =>
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

    const queryIndexCached = (index: string, expression: string, values: any) =>
      pipe(
        E.loop({done: null as null | QueryCommandOutput}, {
          step : identity,
          while: (c) => !c.done || !c.done.LastEvaluatedKey,
          body : (c) =>
            pipe(
              client.queryIndex(index, expression, values, c.done),
              E.map((r) => {
                c.done = r;
                return r.Items ?? [];
              }),
            ),
        }),
        E.map((rs) => rs.flat()),
      );

    return {
      memory,
      ...client,
      createItemCached,
      createItemsCached,
      readItemCached,
      readItemsCached,
      readPartitionCached,
      readIndexCached,
      updateItemCached,
      deleteItemCached,
      deleteItemsCached,
      queryIndexCached,
    };
  }),
  dependencies: [DbClient.Default, DbMemory.Default],
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
