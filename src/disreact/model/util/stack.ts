import * as Element from '#src/disreact/model/entity/element.ts';
import * as MutableList from 'effect/MutableList';
import * as Pipeable from 'effect/Pipeable';

export interface Stack extends Pipeable.Pipeable {
  list: MutableList.MutableList<Element.Node>;
  seen: WeakSet<Element.Node>;
};

export const empty = (): Stack =>
  Object.assign(
    Object.create(Pipeable.Prototype),
    {
      list: MutableList.empty(),
      seen: new WeakSet(),
    },
  );

export const make = (n: Element.Element): Stack => {
  const s = empty();
  push(s, n);
  return s;
};

export const push = (s: Stack, n: Element.Element) => {
  MutableList.append(s.list, n);
};

export const pushAll = (s: Stack, n: Element.Element) => {
  if (!n.rs) {
    return;
  }
  for (let i = n.rs.length - 1; i >= 0; i--) {
    const c = n.rs[i];
    if (!Element.isText(c)) {
      push(s, c);
    }
  }
};

export const pushAllDFS = (s: Stack, n: Element.Element) => {
  if (!n.rs) {
    return;
  }
  push(s, n);
  for (let i = n.rs.length - 1; i >= 0; i--) {
    const c = n.rs[i];
    if (!Element.isText(c)) {
      push(s, c);
    }
  }
};

export const cont = (s: Stack) => !!MutableList.tail(s.list);

export const pull = (s: Stack) => {
  const n = MutableList.pop(s.list)!;
  s.seen.add(n);
  return n;
};

export const seen = (s: Stack, n: Element.Node) => s.seen.has(n);

export const reset = (s: Stack) => {
  s.seen = new WeakSet();
  s.list = MutableList.reset(s.list);
};
