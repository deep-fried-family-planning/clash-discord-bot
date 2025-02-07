import type { Doken} from '#src/disreact/abstract/index.ts';
import type {Auth, DEvent, Rest} from '#src/disreact/abstract/index.ts';
import {NONE_STR} from '#src/disreact/abstract/index.ts';
import type {DecodedRoute} from '#src/disreact/internal/codec/route-codec.ts';
import type {IxId, StacksById} from '#src/disreact/internal/types.ts';
import {E, L} from '#src/internal/pure/effect.ts';
import {Clock, Deferred} from 'effect';

Deferred.

export type IxContext = ReturnType<typeof empty>;
Clock.


const empty = () => ({
  ptr: null as unknown as IxId,


  start_ms        : Date.now(),
  contingencyDoken: null as unknown as Doken.T,
  doken           : null as unknown as Doken.T | null,
  ixid            : '' as unknown as IxId,
  rest            : null as unknown as Rest.Interaction,
  auths           : null as unknown as Auth.T[],
  event           : null as unknown as DEvent.T,
  params          : null as unknown as DecodedRoute['params'],
  stacks          : null as unknown as StacksById,
  root            : NONE_STR,
  next            : NONE_STR,
});



const make = E.gen(function * () {
  let self = null as unknown as ReturnType<typeof empty>;

  const semaphore = yield * E.makeSemaphore(1);
  const mutex     = semaphore.withPermits(1);

  return {
    free : () => self = empty(),
    read : () => self,
    save : (next: ReturnType<typeof empty>) => self = next,
    mutex: () => mutex,
  };
});



export class FiberInteractionDOM extends E.Tag('DisReact.InteractionDOM')<
  FiberInteractionDOM,
  E.Effect.Success<typeof make>
>() {
  static makeLayer = () => L.effect(this, make);
}
