import {decodeItem} from '#src/database/data/codec.ts';
import type {KeyItem} from '#src/database/data/key-item.ts';
import {CompositeCache} from '#src/database/service/CompositeCache.ts';
import {BaseClient} from '#src/database/service/BaseClient.ts';
import {E} from '#src/internal/pure/effect.ts';
import {pipe} from 'effect';
import {Codec} from '../data';

const WILL_UPGRADE = false;
const DEFAULT_FRESH = false;

export class DataDriver extends E.Service<DataDriver>()('deepfryer/Database', {
  effect: E.gen(function* () {
    const {_tag, ...client} = yield* BaseClient;
    const {Items, Partitions, IndexScans, ...cache} = yield* CompositeCache;

    const createItemCached = <A extends Codec = Codec>(codec: A, decoded: any) =>
      pipe(
        Codec.encodeItem(codec, decoded),
        E.tap((encoded) => client.createItem(encoded)),
        E.tap((encoded) => cache.invalidateItem(encoded)),
        E.tap((encoded) => cache.setItem(encoded)),
      );

    const createItemsCached = <A extends Codec = Codec>(codec: A, decoded: any[]) =>
      pipe(
        decoded.map((d) => Codec.encodeItem(codec, d)),
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

    const upgradeItem = <A extends Codec = Codec>(codec: A, decoded: any, upgrade = WILL_UPGRADE) =>
      !upgrade || !decoded.upgraded
        ? E.void
        : E.fork(createItemCached(codec, decoded));

    const readItemCached = <A extends Codec = Codec>(codec: A, pk: any, sk: any, fresh = DEFAULT_FRESH) =>
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

    const deleteItemCached = <A extends Codec = Codec>(codec: A, decoded: KeyItem.ItemLike) => {
      const key = codec.encodeKey(decoded.pk, decoded.sk);

      return pipe(
        client.deleteItem(key),
        E.tap(cache.invalidateItem(key)),
        E.tap(IndexScans.invalidateAll),
      );
    };

    const deleteItemsCached = <A extends Codec = Codec>(codec: A, decoded: KeyItem.ItemLike[]) => {
      const keys = decoded.map((d) => codec.encodeKey(d.pk, d.sk));

      return pipe(
        client.deleteItems(keys),
        E.tap(
          E.forEach(keys, (key) => cache.invalidateItem(key)),
        ),
        E.tap(IndexScans.invalidateAll),
      );
    };

    const scanPartitionEntirelyCached = <A extends Codec = Codec>(codec: A, pk: string, fresh = DEFAULT_FRESH) =>
      pipe(
        fresh
          ? client.scanPartitionEntirely(codec.encodePk(pk))
          : Partitions.get(codec.encodePk(pk)),
        E.tap(
          E.forEach((item) => cache.setItem(item)),
        ),
      );

    const scanIndexEntirelyCached = <A extends Codec = Codec>(codec: A, index: string, fresh = DEFAULT_FRESH) =>
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
  accessors: true,
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
