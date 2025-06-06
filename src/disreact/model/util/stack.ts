import * as El from '#src/disreact/model/entity/element.ts';
import * as MutableList from 'effect/MutableList';
import * as Pipeable from 'effect/Pipeable';

export interface Stack extends Pipeable.Pipeable {
  list: MutableList.MutableList<El.Node>;
  seen: WeakSet<El.Node>;
};

export const empty = (): Stack =>
  Object.assign(
    Object.create(Pipeable.Prototype),
    {
      list: MutableList.empty(),
      seen: new WeakSet(),
    },
  );

export const make = (n: El.Node): Stack => {
  const s = empty();
  push(s, n);
  s.seen;
  return s;
};

export const push = (s: Stack, n: El.El) => {
  MutableList.append(s.list, n);
};

export const pushAll = (s: Stack, n: El.El) => {
  if (!n.rs) {
    return;
  }
  for (let i = n.rs.length - 1; i >= 0; i--) {
    const c = n.rs[i];
    if (!El.isText(c)) {
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

export const seen = (s: Stack, n: El.Node) => s.seen.has(n);

export const reset = (s: Stack) => {
  s.seen = new WeakSet();
  MutableList.reset(s.list);
};
