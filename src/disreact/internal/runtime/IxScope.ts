import type {Auth, DEvent, Doken, Rest} from '#src/disreact/abstract/index.ts';
import {NONE_STR} from '#src/disreact/abstract/index.ts';
import type {DecodedRoute} from '#src/disreact/internal/codec/route-codec.ts';
import type {GlobalContext, HooksById, HookStacksById, InteractionHooks, IxId} from '#src/disreact/internal/types.ts';
import {E, L} from '#src/internal/pure/effect.ts';
import {Deferred} from 'effect';


export type IxCtx = ReturnType<typeof empty>;


const empty = () => ({
  start_ms   : Date.now(),
  pointer    : null as unknown as IxId,
  context    : null as unknown as GlobalContext,
  isEphemeral: null as unknown as boolean,

  global: {
    state  : null as unknown as IxId,
    event  : null as unknown as IxId,
    handler: null as unknown as E.Effect<void, any, any>,
  },

  rx: {
    rest  : null as unknown as Rest.Interaction,
    params: null as unknown as DecodedRoute['params'],
    event : null as unknown as DEvent.T,
    doken : null as unknown as Doken.T | null,
    states: null as unknown as HooksById,
  },

  restDoken: null as unknown as Doken.T,
  doken    : null as unknown as Doken.T | null,
  rest     : null as unknown as Rest.Interaction,
  auths    : null as unknown as Auth.T[],
  event    : null as unknown as DEvent.T,
  params   : null as unknown as DecodedRoute['params'],
  stacks   : null as unknown as HookStacksById,
  states   : null as unknown as HooksById,
  ctx      : null as unknown as InteractionHooks,
  root     : NONE_STR,
  next     : NONE_STR,
});



const make = E.gen(function * () {
  let self = null as unknown as IxCtx;

  const semaphore = yield * E.makeSemaphore(1);
  const mutex     = semaphore.withPermits(1);

  return {
    Type: null as unknown as typeof self,
    free: () => self = empty(),
    read: () => self,
    save: (next: IxCtx) => self = next,

    mutex: () => mutex,
  };
});



export class IxScope extends E.Tag('DisReact.IxScope')<
  IxScope,
  E.Effect.Success<typeof make>
>() {
  static makeLayer = () => L.effect(this, make);
}
