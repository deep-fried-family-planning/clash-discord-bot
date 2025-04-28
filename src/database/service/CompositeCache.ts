import {Codec} from '#src/database/data/codec.ts';
import type {KeyItem} from '#src/database/data/key-item.ts';
import {BaseClient} from '#src/database/service/BaseClient.ts';
import {E, pipe} from '#src/internal/pure/effect.ts';
import {Cache, Duration, Exit} from 'effect';

const toCacheKey = (key: KeyItem.ItemLike) => `${key.pk}/${key.sk}`;

const toCompositeKey = (key: string): KeyItem.CompositeKey => {
  const [pk, sk] = key.split('/');
  return {pk, sk};
};

export class CompositeCache extends E.Service<CompositeCache>()('deepfryer/MemCache', {
  effect: E.gen(function* () {
    const {_tag, ...client} = yield* BaseClient;

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
}) {}
