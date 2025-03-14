import {HookError} from '#src/disreact/codec/error.ts';
import {FiberNode} from '#src/disreact/model/entity/fiber-node.ts';
import {Hydrant} from '#src/disreact/model/entity/fiber-hydrant.ts';



export const $useReducer = <A, B>(reducer: (prev: A, action: B) => A, initialState: A): readonly [A, (action: B) => void] => {
  return [] as any;
};

interface SetState<A> {
  (next: A): void;
  (updater: (prev: A) => A): void;
}

export const $useState = <A>(initial: A): readonly [A, SetState<A>] => {
  const node = FiberNode.λ_λ.get();

  node.stack[node.pc] ??= {s: initial};

  const curr = node.stack[node.pc];

  if (!Hydrant.Stack.isState(curr)) {
    throw new HookError({message: 'Hooks must be called in the same order'});
  }

  const set: SetState<A> = (next) => {
    if (typeof next === 'function') {
      curr.s = (next as (prev: A) => A)(curr.s);
    }
    else {
      curr.s = next;
    }
  };

  node.pc++;

  return [curr.s, set];
};
