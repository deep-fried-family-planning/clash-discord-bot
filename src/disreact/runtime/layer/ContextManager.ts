import type {TAuth} from '#src/disreact/api/auth.ts';
import {Defer, type Rest, type Routes} from '#src/disreact/api/index.ts';
import type {HookStates} from '#src/disreact/model/hooks/hook-state.ts';
import {TTL} from '#src/disreact/runtime/types/index.ts';
import {E, L} from '#src/internal/pure/effect';



export type CurrentContext = ReturnType<typeof makeCurrent>;
type C = CurrentContext;

export type CurrentContextKey = keyof CurrentContext;
type K = CurrentContextKey;



const makeCurrent = () => ({
  id : '',
  app: '',

  rest     : null as unknown as Rest.Interaction,
  auths    : null as unknown as TAuth[],
  route    : null as unknown as Routes.Main,
  states   : null as unknown as HookStates,
  ephemeral: false as boolean,

  event: {
    id    : '',
    node  : '',
    type  : null as unknown as 'onClick' | 'onSubmit',
    target: null as unknown as object,
    values: null as unknown as string[],
  },

  tokens: {
    rest: {
      id       : '',
      value    : '',
      ttl      : TTL.empty(),
      defer    : Defer.None(),
      ephemeral: false as boolean,
    },
    prev: {
      id       : '',
      value    : '',
      ttl      : TTL.empty(),
      defer    : Defer.None(),
      ephemeral: false as boolean,
    },
  },

  message: null as unknown as Rest.Message | null,
  dialog : null as unknown as Rest.Dialog | null,
});



const context = E.gen(function * () {
  let current = makeCurrent();

  return {
    allocate: () => {
      current = makeCurrent();
      return current;
    },
    getKey: <A extends K>(key: A) => current[key],
    setKey: <A extends K>(key: A, value: C[A]) => {current[key] = value},
    setAll: (next: CurrentContext) => current = next,
    getAll: () => current,
  };
});


export class ContextManager extends E.Tag('DisReact.FiberContext')<
  ContextManager,
  E.Effect.Success<typeof context>
>() {
  static Type      = null as unknown as CurrentContext;
  static Key       = null as unknown as CurrentContextKey;
  static makeLayer = () => L.effect(this, context);
}
