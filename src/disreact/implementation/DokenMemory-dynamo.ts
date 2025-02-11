import {Doken} from '#src/disreact/abstract/index.ts';
import {DokenMemoryError} from '#src/disreact/interface/error.ts';
import {DokenMemory} from '#src/disreact/interface/service.ts';
import {C, E, L, pipe} from '#src/internal/pure/effect.ts';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import {Exit} from 'effect';


const asCause = E.catchAll((e: Error) => new DokenMemoryError({cause: e}));

const makeDokenKey = (id: string) => ({
  pk: `t-${id}`,
  sk: `t-${id}`,
});



const make = (TableName: string) => E.gen(function * () {
  const dynamo = yield * DynamoDBDocument;

  const ddbPut = (d: Doken.T) => pipe(
    dynamo.put({
      TableName,
      Item: {...makeDokenKey(d.id), ...d},
    }),
    asCause,
  );

  const ddbGet = (id: string) => pipe(
    dynamo.get({
      TableName,
      Key: makeDokenKey(id),
    }),
    asCause,
    E.map(({Item}) => Item ? Item as Doken.T : Doken.makeEmpty()),
  );

  const ddbDelete = (id: string) => pipe(
    dynamo.delete({
      TableName,
      Key: makeDokenKey(id),
    }),
    asCause,
  );

  const cache = yield * C.makeWith({
    capacity  : 1000,
    lookup    : ddbGet,
    timeToLive: Exit.match({
      onFailure: () => '0 millis',
      onSuccess: (d) => `${d.ttl - Date.now()} millis` as const,
    }),
  });

  const save    = (d: Doken.T) => cache.set(d.id, d).pipe(E.tap(ddbPut(d)));
  const load    = (id: string) => cache.get(id);
  const free    = (id: string) => cache.invalidate(id).pipe(E.tap(ddbDelete(id)));
  const memLoad = (id: string) => cache.contains(id).pipe(E.flatMap((has) => has ? cache.get(id) : E.succeed(Doken.makeEmpty())));
  const memFree = (id: string) => cache.invalidate(id);
  const memSave = (d: Doken.T) => cache.set(d.id, d);

  return {
    kind: 'dynamo' as const,
    load,
    memLoad,
    free,
    memFree,
    save,
    memSave,
  };
});



export const makeDokenMemoryDynamo = (TableName: string) => pipe(
  L.effect(DokenMemory, make(TableName)),
  L.provide(DynamoDBDocument.defaultLayer),
);
