import type {Doken, Rest} from '#src/disreact/codec/rest/index.ts';
import {NONE_STR} from '#src/disreact/codec/rest/index.ts';
import type {DisReactPointer} from '#src/disreact/codec/constants/common.ts';
import {E, L} from '#src/internal/pure/effect.ts';
import type {NodeState, RootState} from '../codec/entities';


export type IxCtx = ReturnType<typeof empty>;


const empty = () => ({
  start_ms   : Date.now(),
  pointer    : null as unknown as DisReactPointer,
  context    : null as unknown as RootState.Type,
  isEphemeral: null as unknown as boolean,

  global: {
    state  : null as unknown as DisReactPointer,
    event  : null as unknown as DisReactPointer,
    handler: null as unknown as E.Effect<void, any, any>,
  },

  rx: {
    rest  : null as unknown as Rest.Interaction,
    params: null as unknown as any,
    event : null as unknown as any,
    doken : null as unknown as Doken.Type | null,
    states: null as unknown as { [k in string]: NodeState.Type },
  },

  restDoken: null as unknown as Doken.Type,
  doken    : null as unknown as Doken.Type | null,
  rest     : null as unknown as Rest.Interaction,
  event    : null as unknown as any,
  params   : null as unknown as any,
  stacks   : null as unknown as { [k in string]: NodeState.Type['stack'] },
  states   : null as unknown as { [k in string]: NodeState.Type },
  root     : NONE_STR,
  next     : NONE_STR,
});



const make = E.gen(function* () {
  let self = null as unknown as IxCtx;

  const semaphore = yield* E.makeSemaphore(1);
  const mutex     = semaphore.withPermits(1);

  return {
    Type: null as unknown as typeof self,
    free: () => self = empty(),
    read: () => self,
    save: (next: IxCtx) => self = next,

    mutex: () => mutex,
  };
});



export class DisReactFrame extends E.Tag('DisReact.Frame')<
  DisReactFrame,
  E.Effect.Success<typeof make>
>() {
  static readonly makeLayer = () => L.effect(this, make);
}
