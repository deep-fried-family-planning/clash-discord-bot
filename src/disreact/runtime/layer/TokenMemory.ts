import type {Defer} from '#src/disreact/api';
import type {Token} from '#src/disreact/api/token.ts';
import type {TTL} from '#src/disreact/runtime/types/index.ts';
import {C, E, L} from '#src/internal/pure/effect.ts';
import type {EAR} from '#src/internal/types.ts';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import {Duration} from 'effect';



type MemoryToken = {
  val  : string;
  ttl  : TTL.TTL;
  defer: string;
};


const makeKey = (id: string) => ({
  pk: `t-${id}`,
  sk: `t-${id}`,
});


const program = (TableName: string) => E.gen(function * () {
  const cache = yield * C.makeWith({
    capacity: 1000,

    timeToLive: (exit) => exit._tag === 'Success' && exit.value
      ? Duration.millis(exit.value.ttl)
      : Duration.millis(0),

    lookup: (id: string) => E.gen(function * () {
      const resp = yield * DynamoDBDocument.get({TableName: process.env.DDB_OPERATIONS, Key: makeKey(id)});

      return resp.Item ? resp.Item as MemoryToken : null;
    }),
  });

  const invalidate = (id: string) => E.gen(function * () {
    yield * cache.invalidate(id);
    yield * DynamoDBDocument.delete({TableName, Key: makeKey(id)});
  });

  const save = (id: string, token: MemoryToken) => E.gen(function * () {
    yield * cache.set(id, token);
    yield * DynamoDBDocument.put({
      TableName,
      Item: {
        ...makeKey(id),
        val  : token.val,
        ttl  : token.ttl,
        defer: token.defer,
      },
    });
  });

  return {
    cache,
    invalidate,
    save,
    load: (id: string) => cache.get(id),
    set : (id: string, token: MemoryToken) => cache.set(id, token),
    get : (id: string) => E.gen(function * () {
      if (yield * cache.contains(id)) {
        return yield * cache.get(id);
      }
      return null;
    }),
  };
}).pipe(E.provide(DynamoDBDocument.defaultLayer));


export class TokenMemory extends E.Tag('DisReact.TokenMemory')<
  TokenMemory,
  EAR<typeof program>
>() {
  static Type  = null as unknown as Token;
  static Token = null as unknown as Token;

  static singleton = (TableName: string) => L.effect(this, program(TableName));
}
