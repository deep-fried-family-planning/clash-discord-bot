import {type Codec, decodeItem, encodeItem} from '#src/database/arch-data/codec.ts';
import type {KeyItem} from '#src/database/arch-data/key-item.ts';
import {DataCache} from '#src/database/service/DataCache.ts';
import {DynamoClient} from '#src/database/service/DynamoClient.ts';
import {E} from '#src/internal/pure/effect.ts';
import {pipe} from 'effect';

const WILL_UPGRADE = false;
const DEFAULT_FRESH = false;

export class Database extends E.Service<Database>()('deepfryer/Database', {
  effect: E.gen(function* () {
    const {_tag, ...client} = yield* DynamoClient;
    const {Items, Partitions, IndexScans, ...cache} = yield* DataCache;

    const createItemCached = (codec: Codec, decoded: any) =>
      pipe(
        encodeItem(codec, decoded),
        E.tap((encoded) => client.createItem(encoded)),
        E.tap((encoded) => cache.invalidateItem(encoded)),
        E.tap((encoded) => cache.setItem(encoded)),
      );

    const createItemsCached = (codec: Codec, decoded: any[]) =>
      pipe(
        decoded.map((d) => encodeItem(codec, d)),
        E.allWith({}),
        E.tap((encoded) => client.createItems(encoded)),
        E.tap(
          E.forEach((encoded) =>
            pipe(
              cache.invalidateItem(encoded),
              E.tap(cache.setItem(encoded)),
            ),
          ),
        ),
      );

    const upgradeItem = (codec: Codec, decoded: any, upgrade = WILL_UPGRADE) =>
      !upgrade || !decoded.upgraded
        ? E.void
        : E.fork(createItemCached(codec, decoded));

    const readItemCached = (codec: Codec, pk: any, sk: any, fresh = DEFAULT_FRESH) =>
      pipe(
        fresh
          ? client.readItem(codec.encodeKey(pk, sk))
          : cache.getItem(codec.encodeKey(pk, sk)),
        E.tap((encoded) => cache.setItem(encoded)),
        E.flatMap((encoded) => decodeItem(codec, encoded)),
        E.tap((decoded) => upgradeItem(codec, decoded)),
      );

    const updateItemCached = (key: any) =>
      pipe(
        client.update({} as any),
      );

    const deleteItemCached = (codec: Codec, decoded: KeyItem.ItemLike) => {
      const key = codec.encodeKey(decoded.pk, decoded.sk);

      return pipe(
        client.deleteItem(key),
        E.tap(cache.invalidateItem(key)),
        E.tap(IndexScans.invalidateAll),
      );
    };

    const deleteItemsCached = (codec: Codec, decoded: KeyItem.ItemLike[]) => {
      const keys = decoded.map((d) => codec.encodeKey(d.pk, d.sk));

      return pipe(
        client.deleteItems(keys),
        E.tap(
          E.forEach(keys, (key) => cache.invalidateItem(key)),
        ),
        E.tap(IndexScans.invalidateAll),
      );
    };

    const scanPartitionEntirelyCached = (codec: Codec, pk: string, fresh = DEFAULT_FRESH) =>
      pipe(
        fresh
          ? client.scanPartitionEntirely(codec.encodePk(pk))
          : Partitions.get(codec.encodePk(pk)),
        E.tap(
          E.forEach((item) => cache.setItem(item)),
        ),
      );

    const scanIndexEntirelyCached = (index: string, fresh = DEFAULT_FRESH) =>
      pipe(
        fresh
          ? client.scanIndexEntirely(index)
          : IndexScans.get(index),
        E.tap(
          E.forEach((item) => cache.setItem(item)),
        ),
      );

    return {
      memory: cache,
      ...client,
      createItemCached,
      createItemsCached,
      readItemCached,
      updateItemCached,
      deleteItemCached,
      deleteItemsCached,
      scanPartitionEntirelyCached,
      scanIndexEntirelyCached,
    };
  }),
  dependencies: [DynamoClient.Default, DataCache.Default],
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
