import type {Defer, Ix, Rest, Token} from '#src/disreact/api/index.ts';
import type {DisReactRoute} from '#src/disreact/api/route.ts';
import {E, L} from '#src/internal/pure/effect.ts';



export type CurrentContext = ReturnType<typeof makeCurrent>;
type C = CurrentContext;

export type CurrentContextKey = keyof CurrentContext;
type K = CurrentContextKey;


const makeCurrent = () => ({
  rest       : null as unknown as Rest.Interaction,
  restDefer  : null as unknown as Defer.Defer,
  restToken  : null as unknown as Token.Token,
  ix         : null as unknown as Ix.Ix,
  activeDefer: null as unknown as Defer.Defer,
  activeToken: null as unknown as Token.Token,
  info       : null as unknown as DisReactRoute,
});


const context = E.gen(function * () {
  let current = makeCurrent();

  return {
    reallocate: () => {
      current = makeCurrent();
    },
    getKey: <A extends K>(key: A) => current[key],
    setKey: <A extends K>(key: A, value: C[A]) => {
      current[key] = value;
    },
    mapKey: <A extends K>(key: A, f: (value: C[A]) => C[A]) => current[key] = f(current[key]),
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
