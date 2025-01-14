import {DT, E, g, L, pipe} from '#pure/effect';
import type {Tx} from '#src/internal/disreact/entity/index.ts';
import {type Auth, type Ix, VDocument, type VEvent} from '#src/internal/disreact/entity/index.ts';
import type {rec, str} from '#src/internal/pure/types-pure.ts';
import type {EAR} from '#src/internal/types.ts';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import {Cache} from 'effect';


const implementation = () => E.gen(function * () {
  const documents = {} as rec<VDocument.T>;
  let interaction = {} as Ix.Rest;

  let rest   = VDocument.makeEmpty();
  let curr   = VDocument.makeEmpty();
  let events = [] as VEvent.VEvent[];

  const ids_tokens = {} as rec<str>;

  const semaphore = yield * E.makeSemaphore(1);
  const mutex     = semaphore.withPermits(1);


  const interactions = yield * Cache.make({
    capacity  : 1000,
    timeToLive: '12 minutes',
    lookup    : () => E.succeed(),
  });


  return {
    allocate: (ix: Ix.Rest) => (E.gen(function * () {
      interaction       = ix;
      rest              = VDocument.makeEmpty();
      curr              = VDocument.makeEmpty();
      events            = [];
      ids_tokens[ix.id] = ix.token;

      // const key = { pk: `ix-${ix.id}`, sk: `ix`, }; const ttl = yield * pipe( DT.now, E.map(DT.addDuration('5 minutes')), E.map(DT.toEpochMillis), );  yield * E.fork(DynamoDBDocument.put({ TableName: process.env.DDB_OPERATIONS, Item     : { ...key, type : 'DiscordIx', token: ix.token, ttl  : ttl, }, }));
    })),

    getIx: (id: str) => mutex(E.gen(function * () {
      // const key = { pk: `ix-${id}`, sk: `ix`, }; return yield * E.fork( DynamoDBDocument.get({ TableName: process.env.DDB_OPERATIONS, Key      : key, }), );

      if (id in ids_tokens) {
        return ids_tokens[id];
      }
      else {
        return null;
      }
    })),

    update: (fn: (v: VDocument.T) => VDocument.T) => mutex(g(function * () {
      curr = fn(curr);
      yield * E.logTrace(`document updated`);
      return curr;
    })),

    getRest: () => mutex(E.succeed(rest)),
    setRest: (v: VDocument.T) => mutex(E.sync(() => {
      rest = v;
    })),

    current: () => mutex(E.succeed(curr)),

    commit: () => mutex(E.sync(() => {
      documents[interaction.id] = curr;
      return curr;
    })),

    getAuths: () => mutex(E.succeed([] as Auth.T[])),

    nextEvent: () => mutex(E.succeed(events.shift())),
    pushEvent: (event: VEvent.VEvent) => mutex(E.sync(() => {
      events.push(event);
    })),
    unshiftEvent: (event: VEvent.VEvent) => mutex(E.sync(() => {
      events.unshift(event);
    })),

    saveDialogMessage: (id: str, message: Tx.Message) => mutex(g(function * () {
      yield * E.logTrace('message saved');

      const key = {
        pk: `t-${id}`,
        sk: `t-${id}`,
      };

      const ttl = yield * pipe(
        DT.now,
        E.map(DT.addDuration('5 minutes')),
        E.map(DT.toEpochMillis),
      );

      yield * E.fork(DynamoDBDocument.put({
        TableName: process.env.DDB_OPERATIONS,
        Item     : {
          ...key,
          type   : 'DiscordDialogSubmitRelay',
          message: JSON.stringify(message),
          ttl    : ttl,
        },
      }));

      return message;
    })),
    loadDialogMessage: (id: str) => mutex(g(function * () {
      yield * E.logTrace('message loaded');

      const key = {
        pk: `t-${id}`,
        sk: `t-${id}`,
      };

      const resp = yield * DynamoDBDocument.get({
        TableName: process.env.DDB_OPERATIONS,
        Key      : key,
      });

      return JSON.parse(resp.Item!.message as str) as Tx.Message;
    })),
  };
});


export class MemoryStore extends E.Tag('MemoryStore')<
  MemoryStore,
  EAR<typeof implementation>
>() {
  static makeLayer = () => L.effect(this, implementation());
}
