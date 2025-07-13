import * as Elem from '#disreact/model/Elem.ts';
import * as Fn from '#disreact/model/core/Fn.ts';
import * as Hooks from '#disreact/model/Hooks.ts';
import * as E from 'effect/Effect';

const mutex = E.unsafeMakeSemaphore(1);
const acquire = mutex.take(1);
const release = mutex.release(1);

export const initialize = (self: Elem.Elem) => {
  const stack = [self._env.root];

  return E.whileLoop({
    while: () => !!stack.length,
    step : () => {},
    body : () => {
      const cur = stack.pop()!;

      if (!cur.component) {
        return E.void;
      }
      if (typeof cur.component !== 'function') {
        if (cur.children) {
          for (const child of cur.children.toReversed()) {
            stack.push(child);
          }
        }
        return E.void;
      }
      return acquire.pipe(
        E.tap(() => {
          Hooks.active.polymer = cur.polymer;
          return E.void;
        }),
        E.andThen(Fn.normalizeFC(cur.component, cur.props)),
        E.tap(() => {
          Hooks.active.polymer = undefined;
          return release;
        }),
        E.tapDefect(() => release),
        E.map((children) => {
          cur.children = Elem.fromJsxChildren(cur, children);

          for (const child of cur.children.toReversed()) {
            stack.push(child);
          }
        }),
      );
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
