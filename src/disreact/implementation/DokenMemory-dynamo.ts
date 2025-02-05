import {Doken} from '#src/disreact/abstract/index.ts';
import {DokenMemoryError} from '#src/disreact/interface/error.ts';
import {DokenMemory} from '#src/disreact/interface/service.ts';
import {C, E, L, pipe} from '#src/internal/pure/effect.ts';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import {Console, Exit} from 'effect';



const makeDokenKey = (id: string) => ({
  pk: `t-${id}`,
  sk: `t-${id}`,
});



const cacheSpec = (TableName: string) => C.makeWith({
  capacity: 1000,

  lookup: (id: string) => E.gen(function * () {
    const resp = yield * pipe(
      DynamoDBDocument.get({
        TableName,
        Key: makeDokenKey(id),
      }),
      E.catchAll(() => E.fail(new DokenMemoryError())),
    );

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



export const makeDynamoDokenMemory = (TableName: string) => pipe(
  L.effect(DokenMemory, E.gen(function * () {
    const cache = yield * cacheSpec(TableName);

    return {
      kind: 'dynamo' as const,
      save: (doken: Doken.T) => pipe(
        cache.set(doken.id, doken),
        E.tap(DynamoDBDocument.put({TableName, Item: {...makeDokenKey(doken.id), ...doken}})),
      ),
      load: (id: string) => cache.get(id).pipe(E.tap(() => cache.cacheStats.pipe(E.flatMap(Console.log)))),
      free: (id) => pipe(
        cache.invalidate(id),
        E.tap(DynamoDBDocument.delete({
          TableName,
          Key: makeDokenKey(id),
        })),
      ),
      memSave: (doken: Doken.T) => cache.set(doken.id, doken),
      memLoad: (id) => cache.get(id),
      memFree: (id) => cache.invalidate(id),
    };
  })),
  L.provide(DynamoDBDocument.defaultLayer),
  L.memoize,
);



// export class DokenMemory extends E.Tag('DisReact.DokenMemory')<
//   DokenMemory,
//   EAR<typeof dynamo>
// >() {
//   static makeLayer = (TableName: string) => L.effect(this, dynamo(TableName));
// }
