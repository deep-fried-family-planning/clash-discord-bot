import {C, DT, E, g, L, pipe} from '#pure/effect';
import {NONE} from '#src/internal/disreact/entity/constants.ts';
import {Err} from '#src/internal/disreact/entity/index.ts';
import {Nd} from '#src/internal/disreact/model/entities/index.ts';
import {DOM} from '#src/internal/disreact/model/index.ts';
import {SafeMutex} from '#src/internal/disreact/runtime/layers/safe-mutex.ts';
import type {rec, str} from '#src/internal/pure/types-pure.ts';
import type {EAR} from '#src/internal/types.ts';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';


const memCache = C.make({
  timeToLive: '5 minutes',
  capacity  : 1000,
  lookup    : E.fn('DisReactMemory.load')(function * (id: str) {
    const resp = yield * DynamoDBDocument.get({
      TableName: process.env.DDB_OPERATIONS,
      Key      : {
        pk: `DOM-${id}`,
        sk: 'now',
      },
    });

    if (!resp.Item) {
      return yield * new Err.MemoryUnavailable();
    }

    const record = resp.Item as {dom: str; pk: str; sk: str; ttl: number};

    if (record.ttl < Date.now()) {
      return yield * new Err.MemoryExpired();
    }

    return DOM.decode(JSON.parse(record.dom) as DOM.TEncoded);
  }),
});


const memory = E.fn('DisReactMemory')(function * (rootfns: Nd.KeyedFns) {
  const iterable = Object.entries(rootfns);

  if (iterable.length === 0) return yield * new Err.DevMistake();

  const roots = {} as rec<Nd.T>;

  for (const [name, fn] of iterable) {
    roots[name] = Nd.createRoot(name, fn);
  }

  const cache = yield * memCache;

  const save = E.fn('DisReactMemory.save')(function * (dom: DOM.T) {
    yield * cache.set(dom.id, dom);

    const ttl = yield * pipe(
      DT.now,
      E.map(DT.addDuration('5 minutes')),
      E.map(DT.toEpochMillis),
    );

    yield * E.fork(DynamoDBDocument.put({
      TableName: process.env.DDB_OPERATIONS,
      Item     : {
        pk : `DOM-${dom.id}`,
        sk : 'now',
        ttl,
        dom: JSON.stringify(DOM.encode(dom)),
      },
    }));
  });


  return {
    getNode: (root_name: str, node_name: str) => g(function * () {
      if (!(root_name in roots)) {
        return yield * new Err.DevMistake();
      }
      if (node_name === NONE || root_name === node_name) {
        return roots[root_name];
      }
      if (!(node_name in roots[root_name].childrenByName)) {
        return yield * new Err.DevMistake();
      }
      return roots[root_name].childrenByName[node_name];
    }),

    load: (id: str) => cache.get(id),
    save,
  };
});


export class DisReactMemory extends E.Tag('DisReactMemory')<
  DisReactMemory,
  EAR<typeof memory>
>() {
  static makeLayer = (rootfns: Nd.KeyedFns) => pipe(
    L.effect(this, pipe(
      memory(rootfns),
      SafeMutex.limit,
    )),
    L.provideMerge(DynamoDBDocument.defaultLayer),
  );
}
