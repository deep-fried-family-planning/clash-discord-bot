import {Doken} from '#src/disreact/runtime/enum/index.ts';
import {C, E, L, pipe} from '#src/internal/pure/effect.ts';
import type {EAR} from '#src/internal/types.ts';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import {Console, Exit} from 'effect';

const makeDokenKey = (id: string) => ({
  pk: `t-${id}`,
  sk: `t-${id}`,
});

const dokenatorSpec = (TableName: string) => C.makeWith({
  lookup: (id: string) => pipe(
    DynamoDBDocument.get({
      TableName,
      Key: makeDokenKey(id),
    }),
    E.map((resp) => resp.Item
      ? resp.Item as Doken.T
      : Doken.makeEmpty()),
  ),
  timeToLive: Exit.match({
    onFailure: () => '0 millis' as const,
    onSuccess: (doken) => `${doken.ttl - Date.now()} millis` as const,
  }),
  capacity: 1000,
});

const dokenator = (TableName: string) => pipe(dokenatorSpec(TableName), E.map((cache) => {
  return {
    dokenator: cache,

    save: (doken: Doken.T) => pipe(
      cache.set(doken.id, doken),
      E.tap(DynamoDBDocument.put({
        TableName,
        Item: {
          ...makeDokenKey(doken.id),
          ...doken,
        },
      })),
    ),
    discard: (doken: Doken.T) => cache.invalidate(doken.id),
    destroy: (doken: Doken.T) => pipe(
      cache.invalidate(doken.id),
      E.tap(DynamoDBDocument.delete({
        TableName,
        Key: makeDokenKey(doken.id),
      })),
    ),
    lookup : (id: string) => cache.get(id).pipe(E.tap(() => cache.cacheStats.pipe(E.flatMap(Console.log)))),
    memoize: (doken: Doken.T) => cache.set(doken.id, doken),
  };
}));

interface IDokenCache {
  save: () => void;
  load: () => Doken.T;
}

export class DokenCache extends E.Tag('DisReact.DokenCache')<
  DokenCache,
  IDokenCache
>() {
  static singletonLayer = L.effect(this);
}
