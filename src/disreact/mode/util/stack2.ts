import type * as El from '#src/disreact/mode/entity/el.ts';
import * as MutableList from 'effect/MutableList';

export namespace Stack2 {
  export type Stack2 = {
    m: WeakMap<El.El, number>;
    l: MutableList.MutableList<El.El>;
  };
}
export type Stack2 = Stack2.Stack2;

export const make = (el?: El.El): Stack2.Stack2 => {
  if (el) {
    return {
      m: new WeakMap<El.El, number>().set(el, 1),
      l: MutableList.make(el),
    };
  }
  return {
    m: new WeakMap<El.El, number>(),
    l: MutableList.empty(),
  };
};

export const check = (stack: Stack2.Stack2) => !!MutableList.tail(stack.l);

export const count = (stack: Stack2.Stack2, el: El.El) => stack.m.get(el) ?? 0;

export const pop = (stack: Stack2.Stack2) => {
  const el = MutableList.pop(stack.l)!;
  const count = stack.m.get(el)!;
  if (count === 1) {
    stack.m.delete(el);
  }
  else {
    stack.m.set(el, count - 1);
  }
  return MutableList.pop(stack.l)!;
};

export const push = (stack: Stack2.Stack2, next: El.El) => {
  const count = stack.m.get(next) ?? 0;
  stack.m.set(next, count + 1);
  return MutableList.append(stack.l, next);
};
