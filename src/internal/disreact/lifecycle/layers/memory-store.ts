import {DT, E, g, L, pipe} from '#pure/effect';
import type {Tx} from '#src/internal/disreact/entity/index.ts';
import {type Auth, type Ix, VDocument, type VEvent} from '#src/internal/disreact/entity/index.ts';
import type {rec, str} from '#src/internal/pure/types-pure.ts';
import type {EAR} from '#src/internal/types.ts';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';


const implementation = () => E.gen(function * () {
  const documents = {} as rec<VDocument.T>;
  let interaction = {} as Ix.Rest;

  let rest   = VDocument.makeEmpty();
  let curr   = VDocument.makeEmpty();
  let events = [] as VEvent.VEvent[];

  const semaphore = yield * E.makeSemaphore(1);
  const mutex     = semaphore.withPermits(1);

  return {
    allocate: (ix: Ix.Rest) => mutex(E.sync(() => {
      interaction = ix;
      rest        = VDocument.makeEmpty();
      curr        = VDocument.makeEmpty();
      events      = [];
    })),

    update: (fn: (v: VDocument.T) => VDocument.T) => mutex(E.sync(() => {
      curr = fn(curr);
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
      const key = {
        pk: `t-${id}`,
        sk: `t-${id}`,
      };

      const ttl = yield *  pipe(
        DT.now,
        E.map(DT.addDuration('5 minutes')),
        E.map(DT.toEpochMillis),
      );

      yield * DynamoDBDocument.put({
        TableName: process.env.DDB_OPERATIONS,
        Item     : {
          ...key,
          type   : 'DiscordDialogSubmitRelay',
          message: JSON.stringify(message),
          ttl    : ttl,
        },
      });

      return message;
    })),
    loadDialogMessage: (id: str) => mutex(g(function * () {
      const key = {
        pk: `t-${id}`,
        sk: `t-${id}`,
      };

      const resp = yield * DynamoDBDocument.get({
        TableName: process.env.DDB_OPERATIONS,
        Key      : key,
      });

      yield * DynamoDBDocument.delete({
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
