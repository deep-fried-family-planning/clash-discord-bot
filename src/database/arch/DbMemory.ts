import {DbClient} from '#src/database/arch/DbClient.ts';
import {KeyComposite} from '#src/database/arch/key-composite.ts';
import {E, M, pipe} from '#src/internal/pure/effect.ts';
import type {QueryCommandOutput, ScanCommandOutput} from '@aws-sdk/lib-dynamodb';
import {Cache, Duration, Exit, identity} from 'effect';
import {TagMap} from '../schema';

export class DbMemory extends E.Service<DbMemory>()('deepfryer/DbMemory', {
  effect: E.gen(function* () {
    const dynamo = yield* DbClient;

    const Items = yield* Cache.makeWith({
      capacity  : 10000,
      timeToLive: Exit.match({
        onFailure: () => Duration.zero,
        onSuccess: (ex) => ex._tag in TagMap
          ? Duration.minutes(3)
          : Duration.minutes(5),
      }),
      lookup: (key: string) => {
        const [pk, sk] = key.split('/');

        return pipe(
          dynamo.readItem({pk, sk}),
          E.flatMap((res) => E.fromNullable(res.Item)),
        );
      },
    });

    const setItem = (keyed: KeyComposite, item?: any) =>
      pipe(
        M.value(keyed),
        M.when(
          KeyComposite.isLookup,
          (lookup) => item
            ? Items.set(lookup, item)
            : E.fail('absurd'),
        ),
        M.when(
          KeyComposite.isItem,
          (item) => Items.set(KeyComposite.toLookup(item), item),
        ),
        M.whenOr(
          KeyComposite.isKnown,
          KeyComposite.isComp,
          (key) => item
            ? Items.set(KeyComposite.toLookup(key), item)
            : E.fail('absurd'),
        ),
        M.exhaustive,
      );

    const setItems = (keyeds: KeyComposite[]) =>
      E.forEach(keyeds, (keyed) => setItem(keyed));

    const Partitions = yield* Cache.makeWith({
      capacity  : 1000,
      timeToLive: Exit.match({
        onFailure: () => Duration.zero,
        onSuccess: () => Duration.minutes(3),
      }),
      lookup: (pk: string) =>
        pipe(
          E.loop({done: null as null | QueryCommandOutput}, {
            step : identity,
            while: (c) => !c.done || !!c.done?.LastEvaluatedKey,
            body : (c) =>
              pipe(
                dynamo.readPartition(pk, c.done),
                E.map((res) => {
                  c.done = res;
                  return res.Items ?? [];
                }),
              ),
          }),
          E.map((cs) => cs.flat()),
        ),
    });

    const IndexScans = yield* Cache.makeWith({
      capacity  : 10,
      timeToLive: Exit.match({
        onFailure: () => Duration.zero,
        onSuccess: () => Duration.minutes(3),
      }),
      lookup: (index: string) =>
        pipe(
          E.loop({done: null as null | ScanCommandOutput}, {
            step : identity,
            while: (c) => c.done === null || !!c.done?.LastEvaluatedKey,
            body : (c) =>
              pipe(
                dynamo.scan({
                  TableName        : dynamo.TableName,
                  IndexName        : index,
                  ExclusiveStartKey: c.done?.LastEvaluatedKey,
                }),
                E.map((res) => {
                  c.done = res;
                  return res.Items ?? [];
                }),
              ),
          }),
          E.map((rs) => rs.flat()),
        ),
    });

    return {
      Items,
      setItem,
      setItems,
      Partitions,
      IndexScans,
    };
  }),
  dependencies: [DbClient.Default],
}) {}
