import {DynamoClient} from '#src/database/service/DynamoClient.ts';
import type {KeyItem} from '#src/database/arch-data/key-item.ts';
import {Codec} from '#src/database/arch-data/codec.ts';
import {E, pipe} from '#src/internal/pure/effect.ts';
import {Cache, Duration, Exit} from 'effect';

const toCacheKey = (key: KeyItem.ItemLike) => `${key.pk}/${key.sk}`;

const toCompositeKey = (key: string): KeyItem.CompositeKey => {
  const [pk, sk] = key.split('/');
  return {pk, sk};
};

export class DataCache extends E.Service<DataCache>()('deepfryer/MemCache', {
  effect: E.gen(function* () {
    const {_tag, ...client} = yield* DynamoClient;

    const Items = yield* Cache.makeWith({
      capacity  : 10000,
      timeToLive: Exit.match({
        onFailure: () => Duration.zero,
        onSuccess: (ex) => ex._tag in Codec.TagMap
          ? Duration.minutes(3)
          : Duration.minutes(5),
      }),
      lookup: (cacheKey: string) =>
        client.readItem(toCompositeKey(cacheKey)),
    });

    const Partitions = yield* Cache.makeWith({
      capacity  : 1000,
      timeToLive: Exit.match({
        onFailure: () => Duration.zero,
        onSuccess: () => Duration.minutes(3),
      }),
      lookup: (partitionKey: string) =>
        client.scanPartitionEntirely(partitionKey),
    });

    const IndexScans = yield* Cache.makeWith({
      capacity  : 10,
      timeToLive: Exit.match({
        onFailure: () => Duration.zero,
        onSuccess: () => Duration.minutes(3),
      }),
      lookup: (index: string) =>
        client.scanIndexEntirely(index),
    });

    return {
      getItem: (key: KeyItem.ItemLike) =>
        Items.get(toCacheKey(key)),

      setItem: (item: KeyItem.Item) =>
        Items.set(toCacheKey(item), item),

      invalidateItem: (item: KeyItem.ItemLike) =>
        pipe(
          Items.invalidate(toCacheKey(item)),
          E.andThen(Partitions.invalidate(item.pk)),
        ),

      Items,
      Partitions,
      IndexScans,
    };
  }),
  dependencies: [DynamoClient.Default],
}) {}
