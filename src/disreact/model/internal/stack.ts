import * as Element from '#src/disreact/model/internal/core/element.ts';
import {dual} from 'effect/Function';
import * as MutableList from 'effect/MutableList';
import * as Pipeable from 'effect/Pipeable';

export interface Stack extends Pipeable.Pipeable {
  list : MutableList.MutableList<Element.Element>;
  seen : WeakSet<Element.Element>;
  flags: Set<Element.Func>;
};

const Proto = {
  ...Pipeable.Prototype,
};

export const empty = (): Stack =>
  Object.assign(
    {
      list : MutableList.empty(),
      seen : new WeakSet(),
      flags: new Set(),
    },
    Pipeable.Prototype,
  ) as Stack;

export const make = (n: Element.Element): Stack => {
  const s = empty();
  return push(s, n);
};

export const push = (s: Stack, n: Element.Element) => {
  MutableList.append(s.list, n);
  return s;
};

export const pushNodes = dual<
  (s: Stack) => (n: Element.Element) => Stack,
  (s: Stack, n: Element.Element) => Stack
>(
  2, (s: Stack, n: Element.Element) => {
    if (!n.rs) {
      return s;
    }
    for (let i = n.rs.length - 1; i >= 0; i--) {
      const c = n.rs[i];
      if (!Element.isText(c)) {
        push(s, c);
      }
    }
    return s;
  },
);

export const pushNodeInto = dual<
  (s: Stack) => (n: Element.Element) => Stack,
  (n: Element.Element, s: Stack) => Stack
>(
  2, (n: Element.Element, s: Stack) => pushNodes(s, n),
);

export const next = (s: Stack) => !!MutableList.tail(s.list);

export const pull = (s: Stack) => {
  const n = MutableList.pop(s.list)!;
  return n;
};

export const pullWith = (s: Stack, f: (n: Element.Element) => boolean) => {
};

export const visit = (s: Stack, n: Element.Element) => {
  s.seen.add(n);
  return s;
};

export const visited = (s: Stack, n: Element.Element) => s.seen.has(n);

export const reset = (s: Stack): Element.Func[] => {
  s.seen = new WeakSet();
  MutableList.reset(s.list);
  const nodes = [...s.flags];
  s.flags.clear();
  return nodes;
};

export const flag = (s: Stack, n: Element.Func) => {
  s.flags.add(n);
  return s;
};

export const flagAll = (s: Stack, ns: Element.Func[]) => {
  for (const n of ns) {
    flag(s, n);
  }
  return s;
};
