import type * as Lineage from '#src/disreact/core/behaviors/lineage.ts';
import type * as Document from '#src/disreact/core/document.ts';
import type * as Node from '#src/disreact/core/node.ts';
import {INTERNAL_ERROR, IS_DEV} from '#src/disreact/core/primitives/constants.ts';
import * as proto from '#src/disreact/core/primitives/proto.ts';
import type * as type from '#src/disreact/core/primitives/type.ts';
import * as Array from 'effect/Array';
import * as E from 'effect/Effect';
import {dual, pipe} from 'effect/Function';
import * as iterable from 'effect/Iterable';
import * as MutableList from 'effect/MutableList';
import * as Pipeable from 'effect/Pipeable';

const TypeId = Symbol.for('disreact/stack');

export interface Stack<A = Node.Node> extends Pipeable.Pipeable,
  Lineage.Lineage,
  type.Internal<{
    contains: WeakMap<any, number>;
    done?   : boolean;
    list    : MutableList.MutableList<A>;
    visited : WeakSet<any>;
  }>
{
  readonly [TypeId]: typeof TypeId;
  readonly document: Document.Document<A>;
  readonly root    : A;
};

export const isStack = <A>(u: unknown): u is Stack<A> => typeof u === 'object' && u !== null && TypeId in u;

const Prototype = proto.type<Stack<any>>({
  [TypeId]: TypeId,
  ...Pipeable.Prototype,
});

const empty = <A>(root: A, document: Document.Document<A>): Stack<A> =>
  proto.init(Prototype, {
    document : document,
    root     : root,
    _internal: {
      list    : MutableList.empty<any>(),
      visited : new WeakSet<any>(),
      contains: new WeakMap<any, number>(),
    },
  });

export const root = <A>(document: Document.Document<A>): Stack<A> => {
  const self = proto.init(Prototype, {
    document : document,
    root     : document.root,
    _internal: {
      list    : MutableList.empty<any>(),
      visited : new WeakSet<any>(),
      contains: new WeakMap<any, number>(),
    },
  });
  return push(self, document.root);
};

export const make = <A>(root: A): Stack<A> => {
  const self = proto.init(Prototype, {
    root: root,
  });
  return push(self, root);
};

export const terminate = <A>(self: Stack<A>) => {
  self._internal.done = true;
  MutableList.reset(self._internal.list);
  return self;
};

export const condition = <A>(self: Stack<A>) =>
  !self._internal.done
  && MutableList.length(self._internal.list) > 0;

export const pop = <A>(self: Stack<A>) => {
  if (IS_DEV && self._internal.done) {
    throw new Error(INTERNAL_ERROR);
  }
  const a = MutableList.pop(self._internal.list)!;
  const i = self._internal.contains.get(a);

  if (IS_DEV && !i) {
    throw new Error(INTERNAL_ERROR);
  }
  self._internal.contains.delete(a);
  return a;
};

export const popWith = dual<
  <A, B>(f: (a: A, s: Stack<A>) => B) => (s: Stack<A>) => B,
  <A, B>(s: Stack<A>, f: (a: A, s: Stack<A>) => B) => B
>(2, (s, f) => f(pop(s), s));

export const popSPS = dual<
  <A, E, R>(f: (a: A, self: Stack<A>) => E.Effect<Stack<A>, E, R>) => (self: Stack<A>) => E.Effect<Stack<A>, E, R>,
  <A, E, R>(self: Stack<A>, f: (a: A, self: Stack<A>) => E.Effect<Stack<A>, E, R>) => E.Effect<Stack<A>, E, R>
>(2, (self, f) => {});

type PM<A, B, C> = {
  visited: (a: A) => type.UnifyM<[B, C]>;
  unseen : (a: A) => type.UnifyM<[B, C]>;
};
export const popMatch = dual<
  <A, B, C>(m: PM<A, B, C>) => (self: Stack<A>) => type.UnifyM<[B, C]>,
  <A, B, C>(self: Stack<A>, m: PM<A, B, C>) => type.UnifyM<[B, C]>
>(2, (self, m) => {
  const a = pop(self);
  if (self._internal.visited.has(a)) {
    return m.visited(a);
  }
  return m.unseen(a);
});

export const push = dual<
  <A>(a: A) => (self: Stack<A>) => Stack<A>,
  <A>(self: Stack<A>, a: A) => Stack<A>
>(2, (self, a) => {
  if (IS_DEV && self._internal.contains.has(a)) {
    throw new Error(INTERNAL_ERROR);
  }
  self._internal.contains.set(a, 1);
  MutableList.append(self._internal.list, a);
  return self;
});

export const pushAll = dual<
  <A>(as?: Iterable<A>) => (self: Stack<A>) => Stack<A>,
  <A>(self: Stack<A>, as?: Iterable<A>) => Stack<A>
>(2, (self, as) => {
  if (!as) {
    return self;
  }
  return iterable.reduce(as, self, (z, a) => push(z, a));
});

export const pushAllInto = dual<
  <A>(s: Stack<A>) => (as: Iterable<A> | undefined) => Stack<A>,
  <A>(as: Iterable<A> | undefined, s: Stack<A>) => Stack<A>
>(2, (as, self) => pushAll(self, as));

export const visited = dual<
  <A>(a: A) => (s: Stack<A>) => boolean,
  <A>(s: Stack<A>, a: A) => boolean
>(2, (self, a) => self._internal.visited.has(a));

export const visit = dual<
  <A>(a: A) => (self: Stack<A>) => A,
  <A>(self: Stack<A>, a: A) => A
>(2, (self, a) => {
  self._internal.visited.add(a);
  return a;
});

export const forget = dual<
  <A>(a: A) => (self: Stack<A>) => Stack<A>,
  <A>(self: Stack<A>, a: A) => Stack<A>
>(2, (self, a) => {
  self._internal.visited.delete(a);
  return self;
});

export const toDocument = <A>(self: Stack<A>): Document.Document<A> => self.document;

export const map = dual<
  <A, B>(f: (a: A) => B) => (selfA: Stack<A>) => Stack<B>,
  <A, B>(selfA: Stack<A>, f: (a: A) => B) => Stack<B>
>(2, (selfA, f) => {
  const selfB = empty<any>(selfA.root, selfA.document);

  selfB._internal.list = pipe(
    selfA._internal.list,
    Array.fromIterable,
    Array.map((a) => f(a)),
    Array.reverse,
    MutableList.fromIterable,
  );

  return selfB;
});

export const tap = dual<
  <A>(f: (s: Stack<A>) => void) => (self: Stack<A>) => Stack<A>,
  <A>(self: Stack<A>, f: (s: Stack<A>) => void) => Stack<A>
>(2, (self, f) => {
  f(self);
  return self;
});

export const use = dual<
  <A, B>(f: (s: Stack<A>) => B) => (self: Stack<A>) => B,
  <A, B>(self: Stack<A>, f: (s: Stack<A>) => B) => B
>(2, (self, f) => f(self));

// export const isFlagged = dual<
//   <A>(a: A) => (self: Stack<A>) => boolean,
//   <A>(self: Stack<A>, a: A) => boolean
// >(2, (self, a) => self.flags.has(a));
//
// export const flag = dual<
//   <A>(a: A) => (self: Stack<A>) => Stack<A>,
//   <A>(self: Stack<A>, a: A) => Stack<A>
// >(2, (self, a) => {
//   self.flags.add(a);
//   return self;
// });
//
// export const flagAll = dual<
//   <A>(as: Iterable<A>) => (self: Stack<A>) => Stack<A>,
//   <A>(self: Stack<A>, as: Iterable<A>) => Stack<A>
// >(2, (self, as) => iterable.reduce(as, self, (z, a) => flag(z, a)));
//
// export const unflag = dual<
//   <A>(a: A) => (self: Stack<A>) => Stack<A>,
//   <A>(self: Stack<A>, a: A) => Stack<A>
// >(2, (self, a) => {
//   self.flags.delete(a);
//   return self;
// });
