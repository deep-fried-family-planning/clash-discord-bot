import * as Element from '#src/disreact/model/internal/core/exp/element.ts';
import {INTERNAL_ERROR} from '#src/disreact/model/internal/infrastructure/proto.ts';
import {constant, dual} from 'effect/Function';
import * as MutableList from 'effect/MutableList';
import * as Option from 'effect/Option';
import * as Pipeable from 'effect/Pipeable';

const TypeId = Symbol.for('disreact/stack');

export interface Stack extends Pipeable.Pipeable {
  [TypeId]: typeof TypeId;
  size    : number;
  list    : MutableList.MutableList<Element.Element>;
  seen    : WeakSet<Element.Element>;
  flags   : Set<Element.Func>;
  lca?    : Element.Func | undefined;
  root?   : Element.Element | undefined;
};

export const isStack = (s: unknown): s is Stack =>
  typeof s === 'object'
  && s !== null
  && TypeId in s
  && s[TypeId] === TypeId;

const pure = (s: Stack) => s;

const empty = (): Stack =>
  Object.assign(
    {},
    Pipeable.Prototype,
    {
      [TypeId]: TypeId,
      size    : 0,
      list    : MutableList.empty(),
      seen    : new WeakSet(),
      flags   : new Set(),
      root    : undefined,
      lca     : undefined,
    },
  ) as Stack;

export const getRoot = (s: Stack) => s.root;

export const start = (root: Element.Element): Stack => {
  return empty().pipe(
    modify((s) => {
      s.root = root;
    }),
    push(root),
  );
  // const s = empty();
  // s.root = root;
  // return push(s, root);
};

export const push__ = (s: Stack, n: Element.Element) => {
  MutableList.append(s.list, n);
  s.size++;
  return s;
};

export const push = dual<
  (n: Element.Element) => (s: Stack) => Stack,
  (s: Stack, n: Element.Element) => Stack
>(2, push__);

export const pushNodes__ = (s: Stack, n: Element.Element): Stack => {
  if (!n.under) {
    return s;
  }
  for (let i = n.under.length - 1; i >= 0; i--) {
    const c = n.under[i];
    if (!Element.isText(c)) {
      push(s, c);
    }
  }
  return s;
};

export const pushNodes = dual<
  (n: Element.Element) => (s: Stack) => Stack,
  typeof pushNodes__
>(2, pushNodes__);

export const pushNodesInto__ = (n: Element.Element, s: Stack) => pushNodes__(s, n);

export const pushNodesInto = dual<
  (s: Stack) => (n: Element.Element) => Stack,
  typeof pushNodesInto__
>(2, pushNodesInto__);

export const pop = (s: Stack) => {
  const n = MutableList.pop(s.list)!;
  s.size--;
  return n;
};

export const popUntil__ = <A extends Element.Predicate>(s: Stack, f: A): Element.Refined<A> => {
  let n = pop(s);
  while (!f(n)) {
    n = pop(s);
    if (!n) {
      throw new Error(INTERNAL_ERROR);
    }
  }
  return n as any;
};

export const popUntil = dual<
  <A extends Element.Predicate>(f: A) => (s: Stack) => Element.Refined<A>,
  typeof popUntil__
>(2, popUntil__);

export const peek = (s: Stack) => MutableList.tail(s.list);

export const condition = (s: Stack) => !!peek(s);

export const option = (s: Stack) => {
  const n = peek(s);
  return n ? Option.some(n) : Option.none();
};

export const visit__ = (s: Stack, n: Element.Element) => {
  s.seen.add(n);
  return s;
};

export const visit = dual<
  (n: Element.Element) => (s: Stack) => Stack,
  typeof visit__
>(2, visit__);

export const forget__ = (s: Stack, n: Element.Element) => {
  s.seen.add(n);
  return s;
};

export const forget = dual<
  (n: Element.Element) => (s: Stack) => Stack,
  (s: Stack, n: Element.Element) => Stack
>(
  2, forget__,
);

export const isVisited__ = (s: Stack, n: Element.Element) => s.seen.has(n);

export const isVisited = dual<
  (n: Element.Element) => (s: Stack) => boolean,
  (s: Stack, n: Element.Element) => boolean
>(
  2, isVisited__,
);

export const flag = dual<
  (n: Element.Func) => (s: Stack) => Stack,
  (s: Stack, n: Element.Func) => Stack
>(
  2, (s: Stack, n: Element.Func) => {
    s.flags.add(n);
    return s;
  },
);

export const flagAll = dual<
  (ns: Element.Func[]) => (s: Stack) => Stack,
  (s: Stack, ns: Element.Func[]) => Stack
>(
  2, (s: Stack, ns: Element.Func[]) => {
    for (let i = 0; i < ns.length; i++) {
      flag(s, ns[i]);
    }
    return s;
  },
);

export const unflag = dual<
  (n: Element.Func) => (s: Stack) => Stack,
  (s: Stack, n: Element.Func) => Stack
>(
  2, (s: Stack, n: Element.Func) => {
    s.flags.delete(n);
    return s;
  },
);

export const isFlagged = dual<
  (n: Element.Func) => (s: Stack) => boolean,
  (s: Stack, n: Element.Func) => boolean
>(
  2, (s: Stack, n: Element.Func) => s.flags.has(n),
);

export const restart = (s: Stack) => {
  const lca = Element.lca([...s.flags]);
  if (lca === null) {
    throw new Error(INTERNAL_ERROR);
  }
  if (lca) {
    s.lca = lca;
  }
  s.seen = new WeakSet();
  MutableList.reset(s.list);
  s.flags.clear();
  return s;
};

export const map = dual<
  <A>(f: (s: Stack) => A) => (s: Stack) => A,
  <A>(s: Stack, f: (s: Stack) => A) => A
>(
  2, <A>(s: Stack, f: (s: Stack) => A) => f(s),
);

export const tap = dual<
  (f: (s: Stack) => void) => (s: Stack) => Stack,
  (s: Stack, f: (s: Stack) => void) => Stack
>(
  2, <A>(s: Stack, f: (s: Stack) => A) => {
    f(s);
    return s;
  },
);

export const modify = dual<
  (f: (s: Stack) => Stack | void) => (s: Stack) => Stack,
  (s: Stack, f: (s: Stack) => Stack | void) => Stack
>(
  2, (s: Stack, f: (s: Stack) => Stack | void) => {
    const output = f(s);
    if (isStack(output)) {
      return output;
    }
    return s;
  },
);
