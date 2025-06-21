import * as Element from '#src/disreact/model/adaptor/exp/domain/old/element.ts';
import * as Lineage from '#src/disreact/model/internal/core/lineage.ts';
import type * as Document from '#src/disreact/model/internal/domain/document.ts';
import {dual} from 'effect/Function';
import * as iterable from 'effect/Iterable';
import * as MutableList from 'effect/MutableList';
import * as Option from 'effect/Option';
import * as Pipeable from 'effect/Pipeable';

const TypeId = Symbol.for('disreact/stack');

export interface Stack<A = any> extends Pipeable.Pipeable
{
  [TypeId]: typeof TypeId;
  done    : boolean;
  flags   : Set<A>;
  list    : MutableList.MutableList<A>;
  root    : A;
  seen    : WeakSet<any>;
  z       : Document.Document<A>;
};

export const isStack = <A>(u: unknown): u is Stack<A> => typeof u === 'object' && u !== null && TypeId in u && u[TypeId] === TypeId;

const Prototype = {
  [TypeId]: TypeId,
  done    : false,
  flags   : new Set(),
  list    : MutableList.empty(),
  root    : undefined,
  seen    : new WeakSet(),
  size    : 0,
  z       : undefined as any,
};

const empty = (): Stack =>
  Object.assign(
    {},
    Pipeable.Prototype,
    Lineage.Prototype,
    Prototype,
  ) as Stack;

export const make = <A>(root: A): Stack<A> => {
  const self = empty();
  self.root = root;
  return pushF(self, root);
};

export const pop = <A>(s: Stack<A>) => MutableList.pop(s.list)!;

export const popOption = <A>(s: Stack<A>): Option.Option<A> => Option.fromNullable(pop(s));

export const condition = (s: Stack) => MutableList.length(s.list) > 0;

export const pushF = <A>(s: Stack, a: A) => {
  MutableList.append(s.list, a);
  return s;
};

export const push = dual<
  <A>(a: A) => (s: Stack<A>) => Stack<A>,
  typeof pushF
>(2, pushF);

export const pushAllF = <A>(s: Stack<A>, as?: Iterable<A>): Stack<A> => {
  if (!as) {
    return s;
  }
  return iterable.reduce(as, s, (z, a) => pushF(z, a));
};

export const pushAll = dual<
  <A>(as: Iterable<A>) => (s: Stack<A>) => Stack<A>,
  typeof pushAllF
>(2, pushAllF);

export const pushIntoF = <A>(as: Iterable<A> | undefined, s: Stack<A>): Stack<A> => pushAllF(s, as);

export const pushInto = dual<
  <A>(s: Stack<A>) => (as: Iterable<A> | undefined) => Stack<A>,
  typeof pushIntoF
>(2, pushIntoF);

export const visit__ = <A>(s: Stack<A>, n: A): Stack<A> => {
  s.seen.add(n);
  return s;
};

export const visit = dual<
  (n: Element.Element) => (s: Stack) => Stack,
  typeof visit__
>(2, visit__);

export const forgetF = <A>(s: Stack<A>, n: A): Stack<A> => {
  s.seen.add(n);
  return s;
};

export const forget = dual<
  (n: Element.Element) => (s: Stack) => Stack,
  typeof forgetF
>(2, forgetF);

export const hasVisitedF = <A>(s: Stack<A>, n: A) => s.seen.has(n);

export const hasVisited = dual<
  (n: Element.Element) => (s: Stack) => boolean,
  typeof hasVisitedF
>(2, hasVisitedF);

export const flagF = <A>(s: Stack<A>, a: A) => {
  s.flags.add(a);
  return s;
};

export const flag = dual<
  <A>(a: A) => (s: Stack<A>) => Stack<A>,
  typeof flagF
>(2, flagF);

export const __flagAll = <A>(s: Stack<A>, as: Iterable<A>) =>
  iterable.reduce(as, s, (z, a) => flag(z, a));

export const flagAll = dual<
  <A>(as: Iterable<A>) => (s: Stack<A>) => Stack<A>,
  typeof __flagAll
>(2, __flagAll);

export const __unflag = <A>(s: Stack<A>, a: A) => {
  s.flags.delete(a);
  return s;
};

export const unflag = dual<
  <A>(a: A) => (s: Stack<A>) => Stack<A>,
  typeof __unflag
>(2, __unflag);

export const __isFlagged = <A>(s: Stack<A>, a: A) => s.flags.has(a);

export const isFlagged = dual<
  <A>(a: A) => (s: Stack<A>) => boolean,
  typeof __isFlagged
>(2, __isFlagged);

export const done = <A>(s: Stack<A>): Iterable<A> => s.flags.values();

export const __map = <A>(s: Stack<A>, f: (s: Stack<A>) => A) => f(s);

export const map = dual<
  <A>(f: (s: Stack) => A) => (s: Stack<A>) => A,
  typeof __map
>(2, __map);

export const tap = dual<
  (f: (s: Stack) => void) => (s: Stack) => Stack,
  (s: Stack, f: (s: Stack) => void) => Stack
>(
  2, <A>(s: Stack, f: (s: Stack) => A) => {
    f(s);
    return s;
  },
);

export const pushNodesF = (s: Stack, n: Element.Element): Stack => {
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
  typeof pushNodesF
>(2, pushNodesF);

export const pushNodesInto__ = (n: Element.Element, s: Stack) => pushNodesF(s, n);

export const pushNodesInto = dual<
  (s: Stack) => (n: Element.Element) => Stack,
  typeof pushNodesInto__
>(2, pushNodesInto__);
