import type * as Document from '#disreact/engine/entity/Document.ts';
import * as stack from '#disreact/core/primitives/stack.ts';
import {dual} from 'effect/Function';
import type * as Inspectable from 'effect/Inspectable';
import * as Iterable from 'effect/Iterable';
import type * as Pipeable from 'effect/Pipeable';
import type * as Node from '#disreact/engine/entity/Node.ts';
export interface Stack<A = Node.Node> extends Pipeable.Pipeable, Inspectable.Inspectable {
  document: Document.Document;
  root    : A;
  values  : A[];
}

export const toDocument = <A>(self: Stack<A>): Document.Document => self.document;

export const make = <A>(document: Document.Document, root?: A): Stack<A> =>
  stack.make(document, root as any);

const while$ = <A>(self: Stack<A>) => stack.len(self) > 0;
export {while$ as while};

export const pop = <A>(self: Stack<A>): A => stack.pop(self)!;

export const push = dual<
  <A>(a: A) => (self: Stack<A>) => Stack<A>,
  <A>(self: Stack<A>, a: A) => Stack<A>
>(2, (self, a) => stack.push(self, a));

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
