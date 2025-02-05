import {Doken} from '#src/disreact/abstract/index.ts';
import {C, E, L, pipe} from '#src/internal/pure/effect.ts';
import type {EAR} from '#src/internal/types.ts';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import {Console, Exit} from 'effect';



const makeDokenKey = (id: string) => ({
  pk: `t-${id}`,
  sk: `t-${id}`,
});



const cacheSpec = (TableName: string) => C.makeWith({
  capacity: 1000,

  lookup: (id: string) => E.gen(function * () {
    const resp = yield * DynamoDBDocument.get({
      TableName,
      Key: makeDokenKey(id),
    });

    if (resp.Item) {
      return resp.Item as Doken.T;
    }

    return Doken.makeEmpty();
  }),

  timeToLive: (exit) => {
    if (Exit.isFailure(exit)) {
      return '0 millis' as const;
    }

    return `${exit.value.ttl - Date.now()} millis` as const;
  },
});



const dynamo = (TableName: string) => E.gen(function * () {
  const cache = yield * cacheSpec(TableName);

  return {
    save: (doken: Doken.T) => pipe(
      cache.set(doken.id, doken),
      E.tap(DynamoDBDocument.put({TableName, Item: {...makeDokenKey(doken.id), ...doken}})),
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
});



export class DokenMemory extends E.Tag('DisReact.DokenMemory')<
  DokenMemory,
  EAR<typeof dynamo>
>() {
  static makeLayer = (TableName: string) => L.effect(this, dynamo(TableName));
}
