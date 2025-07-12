import type * as Elem from '#disreact/model/core/Elem.ts';
import * as E from 'effect/Effect';

export const initialize = (self: Elem.Elem) => {
  const stack = [self._env.root];

  return E.whileLoop({
    while: () => !!stack.length,
    body : () => {
      const cur = stack.pop()!;

      if (!cur.component) {
        return E.void;
      }
    },
  });
};

export const hydrate = (self: Elem.Elem) => {
  const stack = [self._env.root];

  return E.whileLoop({
    while: () => !!stack.length,
    body : () => {
      const cur = stack.pop()!;
    },
  });
};
