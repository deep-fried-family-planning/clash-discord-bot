import type * as Document from '#src/disreact/core/document.ts';
import type * as Node from '#src/disreact/core/nodev1.ts';
import {INTERNAL_ERROR, IS_DEV} from '#src/disreact/core/primitives/constants.ts';
import * as proto from '#src/disreact/core/primitives/proto.ts';
import * as Either from 'effect/Either';
import {dual} from 'effect/Function';
import * as Iterable from 'effect/Iterable';
import * as MutableList from 'effect/MutableList';
import type * as Option from 'effect/Option';
import * as Pipeable from 'effect/Pipeable';
import * as Inspectable from 'effect/Inspectable';
import type * as Effectable from 'effect/Effectable';
import type * as Types from 'effect/Types';
import * as Array from 'effect/Array';

export interface Stack<A = Node.Nodev1> extends Pipeable.Pipeable,
  Inspectable.Inspectable
{
  readonly document: Document.Document<A>;
  readonly root    : A;

  counts : WeakMap<any, number>;
  done?  : boolean;
  list   : MutableList.MutableList<A>;
  visited: WeakSet<any>;
};

const Prototype = proto.type<Stack<any>>({
  ...Pipeable.Prototype,
  ...Inspectable.BaseProto,
  toJSON() {
    return Inspectable.format({
      _id   : 'Stack',
      values: [...this.list!],
    });
  },
});

const empty = <A>(root: A, document: Document.Document<A>): Stack<A> =>
  proto.init(Prototype, {
    document: document,
    root    : root,
    list    : MutableList.empty<any>(),
    counts  : new WeakMap<any, number>(),
    visited : new WeakSet<any>(),
  });

export const root = <A>(document: Document.Document<A>): Stack<A> => {
  const self = proto.init(Prototype, {
    document: document,
    root    : document.root,
    list    : MutableList.empty<any>(),
    visited : new WeakSet<any>(),
    counts  : new WeakMap<any, number>(),
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
  (self as Types.DeepMutable<Stack<A>>).document = undefined as any;
  (self as Types.DeepMutable<Stack<A>>).root     = undefined as any;
  self.done                                      = true;
  return self;
};

export const condition = <A>(self: Stack<A>) =>
  !self.done
  && MutableList.length(self.list) > 0;

export const peek = <A>(self: Stack<A>) => {

};

export const pop = <A>(self: Stack<A>) => {
  if (IS_DEV && self.done) {
    throw new Error(INTERNAL_ERROR);
  }
  const popped = MutableList.pop(self.list)!;
  self.counts.delete(popped);
  return popped;
};

export const popWith = dual<
  <A, B>(f: (a: A, s: Stack<A>) => B) => (s: Stack<A>) => B,
  <A, B>(s: Stack<A>, f: (a: A, s: Stack<A>) => B) => B
>(2, (s, f) => f(pop(s), s));

export const push = dual<
  <A>(a: A) => (self: Stack<A>) => Stack<A>,
  <A>(self: Stack<A>, a: A) => Stack<A>
>(2, (self, a) => {
  if (IS_DEV && self.counts.has(a)) {
    throw new Error(INTERNAL_ERROR);
  }
  self.counts.set(a, 1);
  MutableList.append(self.list, a);
  return self;
});

export const pushAll = dual<
  <A>(as?: Iterable<A>) => (self: Stack<A>) => Stack<A>,
  <A>(self: Stack<A>, as?: Iterable<A>) => Stack<A>
>(2, (self, as) => {
  if (!as) {
    return self;
  }
  return Iterable.reduce(as, self, (z, a) => push(z, a));
});

export const pushAllInto = dual<
  <A>(s: Stack<A>) => (as: Iterable<A> | undefined) => Stack<A>,
  <A>(as: Iterable<A> | undefined, s: Stack<A>) => Stack<A>
>(2, (as, self) => pushAll(self, as));

export const visited = dual<
  <A>(a: A) => (s: Stack<A>) => Either.Either<A, A>,
  <A>(s: Stack<A>, a: A) => Either.Either<A, A>
>(2, (self, a) =>
  self.visited.has(a)
  ? Either.right(a)
  : Either.left(a),
);

export const visit = dual<
  <A>(a: A) => (self: Stack<A>) => A,
  <A>(self: Stack<A>, a: A) => A
>(2, (self, a) => {
  self.visited.add(a);
  return a;
});

export const forget = dual<
  <A>(a: A) => (self: Stack<A>) => Stack<A>,
  <A>(self: Stack<A>, a: A) => Stack<A>
>(2, (self, a) => {
  self.visited.delete(a);
  return self;
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

export const syncPopWhile = dual<
  <A, L, R>(f: (a: A, self: Stack<A>) => Either.Either<R, L>) => (self: Stack<A>) => Stack<A>,
  <A, L, R>(self: Stack<A>, f: (a: A, self: Stack<A>) => Either.Either<R, L>) => Stack<A>
>(2, (self, f) => {
  while (condition(self)) {
    const popped = pop(self);
    const result = f(popped, self);
    if (Either.isLeft(result)) {
      return self;
    }
  }
  return self;
});

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
