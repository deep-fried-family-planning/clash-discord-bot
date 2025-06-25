import * as Element from '#src/disreact/model/adaptor/exp/domain/old/element.ts';
import {INTERNAL_ERROR} from '#src/disreact/model/internal/core/constants.ts';
import type * as Document from '#src/disreact/model/internal/document.ts';
import * as proto from '#src/disreact/model/internal/infrastructure/proto.ts';
import {dual} from 'effect/Function';
import * as iterable from 'effect/Iterable';
import * as MutableList from 'effect/MutableList';
import * as Option from 'effect/Option';
import * as Pipeable from 'effect/Pipeable';

const TypeId = Symbol.for('disreact/stack');

export interface Stack<A = any> extends Pipeable.Pipeable
{
  [TypeId]: typeof TypeId;
  document: Document.Document<A>;
  done    : boolean;
  flags   : Set<A>;
  list    : MutableList.MutableList<A>;
  popped? : A | undefined;
  root    : A;
  visited : WeakSet<any>;
};

export const isStack = <A>(u: unknown): u is Stack<A> => typeof u === 'object' && u !== null && TypeId in u && u[TypeId] === TypeId;

const Prototype = proto.declare<Stack>({
  [TypeId]: TypeId,
  document: undefined as any,
  done    : false,
  flags   : new Set(),
  list    : MutableList.empty(),
  root    : undefined,
  visited : new WeakSet(),
  ...Pipeable.Prototype,
});

export const root = <A>(document: Document.Document<A>): Stack<A> => {
  const self = proto.init(Prototype, {
    document: document,
    root    : document.root,
  });
  return push__(self, document.root);
};

export const from = <A>(root: A, document: Document.Document<A>): Stack<A> => {
  const self = proto.init(Prototype, {
    document: document,
    root    : root,
  });
  return push__(self, root);
};

export const make = <A>(root: A): Stack<A> => {
  const self = proto.init(Prototype, {
    root: root,
  });
  return push__(self, root);
};

export const pop = <A>(self: Stack<A>) => {
  const a = MutableList.pop(self.list)!;
  self.popped = a;
  return a;
};

export const popOption = <A>(self: Stack<A>): Option.Option<A> => Option.fromNullable(pop(self));

export const condition = (self: Stack) => MutableList.length(self.list) > 0;

export const push__ = <A>(self: Stack, a: A) => {
  self.list = MutableList.append(self.list, a);
  return self;
};
export const push = dual<<A>(a: A) => (self: Stack<A>) => Stack<A>, typeof push__>(2, push__);

export const pushAll__ = <A>(self: Stack<A>, as?: Iterable<A>): Stack<A> => {
  if (!as) {
    return self;
  }
  return iterable.reduce(as, self, (z, a) => push__(z, a));
};
export const pushAll = dual<<A>(as: Iterable<A>) => (self: Stack<A>) => Stack<A>, typeof pushAll__>(2, pushAll__);

export const pushInto__ = <A>(as: Iterable<A> | undefined, s: Stack<A>): Stack<A> => pushAll__(s, as);
export const pushInto = dual<<A>(s: Stack<A>) => (as: Iterable<A> | undefined) => Stack<A>, typeof pushInto__>(2, pushInto__);

export const visit__ = <A>(self: Stack<A>, a: A): Stack<A> => {
  self.visited.add(a);
  return self;
};
export const visit = dual<<A>(a: A) => (self: Stack<A>) => Stack<A>, typeof visit__>(2, visit__);

export const visitPopped = <A>(self: Stack<A>) => {
  if (!self.popped) {
    throw new Error(INTERNAL_ERROR);
  }
  return visit__(self, self.popped);
};

export const forget__ = <A>(self: Stack<A>, a: A): Stack<A> => {
  self.visited.add(a);
  return self;
};
export const forget = dual<<A>(a: A) => (self: Stack<A>) => Stack<A>, typeof forget__>(2, forget__);

export const visited__ = <A>(s: Stack<A>, a: A) => s.visited.has(a);
export const visited = dual<<A>(a: A) => (s: Stack<A>) => boolean, typeof visited__>(2, visited__);

export const flag__ = <A>(self: Stack<A>, a: A) => {
  self.flags.add(a);
  return self;
};
export const flag = dual<<A>(a: A) => (self: Stack<A>) => Stack<A>, typeof flag__>(2, flag__);

export const flagAll__ = <A>(self: Stack<A>, as: Iterable<A>) => iterable.reduce(as, self, (z, a) => flag(z, a));
export const flagAll = dual<<A>(as: Iterable<A>) => (self: Stack<A>) => Stack<A>, typeof flagAll__>(2, flagAll__);

export const unflag__ = <A>(self: Stack<A>, a: A) => {
  self.flags.delete(a);
  return self;
};
export const unflag = dual<<A>(a: A) => (self: Stack<A>) => Stack<A>, typeof unflag__>(2, unflag__);

export const isFlagged__ = <A>(self: Stack<A>, a: A) => self.flags.has(a);
export const isFlagged = dual<<A>(a: A) => (self: Stack<A>) => boolean, typeof isFlagged__>(2, isFlagged__);

export const done = <A>(self: Stack<A>): Iterable<A> => self.flags.values();

export const map__ = <A>(self: Stack<A>, f: (s: Stack<A>) => A) => f(self);
export const map = dual<<A>(f: (s: Stack) => A) => (self: Stack<A>) => A, typeof map__>(2, map__);

export const tap = dual<
  (f: (s: Stack) => void) => (self: Stack) => Stack,
  (self: Stack, f: (s: Stack) => void) => Stack
>(
  2, <A>(self: Stack, f: (s: Stack) => A) => {
    f(self);
    return self;
  },
);

export const pushNodes__ = (self: Stack, n: Element.Element): Stack => {
  if (!n.under) {
    return self;
  }
  for (let i = n.under.length - 1; i >= 0; i--) {
    const c = n.under[i];
    if (!Element.isText(c)) {
      push(self, c);
    }
  }
  return self;
};
export const pushNodes = dual<(n: Element.Element) => (self: Stack) => Stack, typeof pushNodes__>(2, pushNodes__);

export const pushNodesInto__ = (n: Element.Element, self: Stack) => pushNodes__(self, n);
export const pushNodesInto = dual<(self: Stack) => (n: Element.Element) => Stack, typeof pushNodesInto__>(2, pushNodesInto__);
