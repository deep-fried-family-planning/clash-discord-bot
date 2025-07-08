import type * as Document from '#disreact/core/Document.ts';
import * as internal from '#disreact/core/internal/stack.ts';
import type * as Node from '#disreact/core/Element.ts';
import {dual} from 'effect/Function';
import type * as Inspectable from 'effect/Inspectable';
import * as Iterable from 'effect/Iterable';
import type * as Option from 'effect/Option';
import type * as Pipeable from 'effect/Pipeable';
import type * as P from 'effect/Predicate';
import type * as Traversal from '#disreact/core/Traversal.ts';

export interface Stack<A = Node.Element> extends Pipeable.Pipeable,
  Inspectable.Inspectable,
  Traversal.Origin<Document.Document>,
  Traversal.Ancestor<Stack<A>>,
  Traversal.Descendent<Stack<A>>
{
  root     : A;
  values   : A[];
  push     : A[];
  pop      : A[];
  traversed: A[];
}

export const make = <A>(document: Document.Document, root?: A): Stack<A> =>
  internal.make(document, root as any);

export const condition = <A>(self: Stack<A>) => internal.len(self) > 0;
export {condition as while};

export const pop = <A>(self: Stack<A>): A => internal.pop(self)!;

export const popUntil = <A, B extends A>(self: Stack<A>, f: P.Refinement<A, B> | P.Predicate<A>): Option.Option<B[]> => {
  while (condition(self)) {
    if (!f(internal.peek(self))) {
      break;
    }
    internal.pop(self);
  }
  return internal.popped(self) as any;
};

export const push = dual<
  <A>(a: A) => (self: Stack<A>) => Stack<A>,
  <A>(self: Stack<A>, a: A) => Stack<A>
>(2, (self, a) => internal.push(self, a));

export const pushAll = dual<
  <A>(as: Iterable<A> | undefined) => (self: Stack<A>) => Stack<A>,
  <A>(self: Stack<A>, as: Iterable<A> | undefined) => Stack<A>
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
