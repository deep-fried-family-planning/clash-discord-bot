import type {Auth, DEvent, Rest} from '#src/disreact/abstract/index.ts';
import {NONE_STR} from '#src/disreact/abstract/index.ts';
import type {Hooks, IxId} from '#src/disreact/internal/types.ts';
import {E, L} from '#src/internal/pure/effect.ts';



const empty = () => ({
  id    : '' as unknown as IxId,
  clk   : Date.now(),
  rest  : null as unknown as Rest.Interaction,
  auths : null as unknown as Auth.T[],
  states: {} as {[k in string]: Hooks},
  event : null as unknown as DEvent.T,
  root  : NONE_STR,
  next  : NONE_STR,
  // route: null as unknown as DRoute.Routes,
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



export class InteractionDOM extends E.Tag('DisReact.InteractionDOM')<
  InteractionDOM,
  E.Effect.Success<typeof make>
>() {
  static Live = L.effect(this, make);
}
