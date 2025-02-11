
import type {DEvent, Doken, Rest} from '#src/disreact/abstract/index.ts';
import type {DecodedRoute} from '#src/disreact/internal/codec/route-codec.ts';
import type {HooksById} from '#src/disreact/internal/types.ts';
import {E, L} from '#src/internal/pure/effect.ts';



const make = (id: string) => E.gen(function * () {
  const symbol = Symbol(`DisReact.Ix.${id}`);

  const self = {
    rx: {
      rest  : null as unknown as Rest.Interaction,
      params: null as unknown as DecodedRoute['params'],
      event : null as unknown as DEvent.T,
      doken : null as unknown as Doken.T | null,
      states: null as unknown as HooksById,
    },
  };

  const semaphore = yield * E.makeSemaphore(1);
  const mutex     = semaphore.withPermits(1);

  return {
    symbol    : () => symbol,
    read      : () => self,
    localMutex: () => mutex,
  };
});



export class IxLocal extends E.Tag('DisReact.Runner')<
  IxLocal,
  E.Effect.Success<ReturnType<typeof make>>
>() {
  static makeLayer = (id: string) => L.effect(this, make(id));
}
