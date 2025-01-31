
import type {Events, Routes} from '#src/disreact/enum/index.ts';
import {type Auth, Doken, Rest} from '#src/disreact/enum/index.ts';
import {createRootElement} from '#src/disreact/model/create-element.ts';
import type {TagFunc} from '#src/disreact/model/types.ts';
import {cloneTree, createRootMap} from '#src/disreact/model/traversal.ts';
import {C, D, E, Kv, L, pipe} from '#src/internal/pure/effect.ts';
import type {EA, EAR} from '#src/internal/types.ts';
import {DynamoDBDocument} from '@effect-aws/lib-dynamodb';
import {DiscordREST} from 'dfx/DiscordREST';
import {Console, Exit} from 'effect';



export class CriticalFailure extends D.TaggedError('DisReact.CriticalFailure')<{
  why?: string;
}> {

}

const safeMutex = E.gen(function * () {
  const semaphore = yield * E.makeSemaphore(1);
  const mutex     = semaphore.withPermits(1);

  return {youShallNotPass: () => mutex};
});

export class GlobalMutex extends E.Tag('DisReact.GlobalMutex')<
  GlobalMutex,
  EA<typeof safeMutex>
>() {
  static singleton = L.effect(this, pipe(
    safeMutex,
    E.cached,
    E.flatten,
  ));

  static limit = <A, E, R>(self: E.Effect<A, E, R>) => pipe(
    GlobalMutex.youShallNotPass(),
    E.flatMap((permit) => permit(self)),
    E.provide(GlobalMutex.singleton),
  );
}



const service = pipe(DiscordREST, E.map((rest) => ({
  acknowledge: (doken: Doken.T) => rest.createInteractionResponse(
    doken.id,
    doken.token,
    {type: Rest.DEFER_UPDATE},
  ),
  dismount: (doken: Doken.T) => rest.deleteOriginalInteractionResponse(
    doken.app,
    doken.token,
  ),
  deferRender: (doken: Doken.T) => rest.createInteractionResponse(
    doken.id,
    doken.token,
    doken.flags === 0
      ? {type: doken.type}
      : {type: doken.type, data: {flags: Rest.EPHEMERAL}},
  ),
  renderDirect: (doken: Doken.T, encoded: Rest.Response) => rest.createInteractionResponse(
    doken.id,
    doken.token,
    {
      type: doken.type,
      data: encoded,
    },
  ),
  renderReply: (doken: Doken.T, encoded: Rest.Response) => rest.editOriginalInteractionResponse(
    doken.app,
    doken.token,
    encoded,
  ),
  renderUpdate: (doken: Doken.T, encoded: Rest.Message) => rest.editOriginalInteractionResponse(
    doken.app,
    doken.token,
    encoded,
  ),
  render: (channel_id: string) => rest.createMessage(
    channel_id,
  ),
})));

export class DiscordDOM extends E.Tag('DisReact.DiscordDOM')<
  DiscordDOM,
  E.Effect.Success<typeof service>
>() {
  static singletonLayer = L.effect(this, pipe(
    service,
    E.cached,
    E.flatten,
  ));
}


const fiberDOM = pipe(E.makeSemaphore(1), E.map((semaphore) => {
  const mutex = semaphore.withPermits(1);

  return {
    mutex: () => <A, E, R>(self: E.Effect<A, E, R>): E.Effect<A, E, R> => mutex(self),
    mut  : semaphore.withPermits(1),
  };
}));

export class FiberDOM extends E.Tag('DisReact.FiberDOM')<
  FiberDOM,
  E.Effect.Success<typeof fiberDOM>
>() {
  static makeLayer = () => L.effect(this, fiberDOM);
}



const staticDOM = (initial: TagFunc[]) => E.gen(function * () {
  const rootElements = initial.map((type) => createRootElement(type, {}));
  const rootMap      = createRootMap(rootElements);

  // yield * E.logTrace('staticDOM.rootMap', pipe(rootMap, Kv.mapEntries((v, k) => [k, Object.keys(v)])));

  return {
    checkout: (root: string, node: string) => E.gen(function * () {
      if (!(root in rootMap)) {
        return yield * new CriticalFailure({
          why: `${root}/${node}: Root not found`,
        });
      }
      if (!(node in rootMap[root])) {
        return yield * new CriticalFailure({
          why: `${root}/${node}: Node not found`,
        });
      }
      return cloneTree(rootMap[root][node], true);
    }),
  };
});

export class StaticDOM extends E.Tag('DisReact.StaticDOM')<
  StaticDOM,
  E.Effect.Success<ReturnType<typeof staticDOM>>
>() {
  static singletonLayer = (types: TagFunc[]) => L.effect(this, pipe(
    staticDOM(types),
    E.cached,
    E.flatten,
  ));
}



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

export class DokenCache extends E.Tag('DisReact.Dokenator')<
  DokenCache,
  EAR<typeof dokenator>
>() {
  static singletonLayer = pipe(
    L.effect(this, pipe(
      dokenator(process.env.DDB_OPERATIONS),
      E.provide(DynamoDBDocument.defaultLayer),
    )),
  );
}



const empty = () => ({
  clk  : Date.now(),
  rest : null as unknown as Rest.Interaction,
  auths: null as unknown as Auth.TAuth[],
  route: null as unknown as Routes.Routes,
  event: null as unknown as Events.Events,
});

const interactionContext = E.sync(() => {
  let self = null as unknown as ReturnType<typeof empty>;
  return {
    free: () => self = empty(),
    read: () => self,
    save: (next: ReturnType<typeof empty>) => self = next,
  };
});

export class InteractionContext extends E.Tag('DisReact.InteractionContext')<
  InteractionContext,
  E.Effect.Success<typeof interactionContext>
>() {
  static makeLayer = () => L.effect(this, interactionContext);
}
