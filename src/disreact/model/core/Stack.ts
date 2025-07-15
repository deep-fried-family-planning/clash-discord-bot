import type * as Document from '#disreact/core/Document.ts';
import * as internal from '#disreact/core/internal/stack.ts';
import type * as Node from '#disreact/core/Element.ts';
import {dual} from 'effect/Function';
import type * as Inspectable from 'effect/Inspectable';
import * as Iterable from 'effect/Iterable';
import type * as Option from 'effect/Option';
import type * as Pipeable from 'effect/Pipeable';
import type * as P from 'effect/Predicate';
import type * as Traversal from '#disreact/model/core/Traversable.ts';

export interface Stack<A = Node.Element> extends Inspectable.Inspectable,
  Pipeable.Pipeable
{
  root     : A;
  values   : A[];
  push     : A[];
  pop      : A[];
  traversed: A[];
}

const StackProto: Stack<any> = {
  root     : undefined as any,
  values   : undefined as any,
  push     : undefined as any,
  pop      : undefined as any,
  traversed: undefined as any,
} as Stack<any>;

export const make = <A>(root: A): Stack<A> => {
  const self = Object.create(StackProto);
  self.root = root;
  self.values = [root];
  self.push = [];
  self.pop = [];
  self.traversed = [];
  return self;
};

export const condition = <A>(self: Stack<A>) => self.values.length > 0;

export const pop = <A>(self: Stack<A>): A => self.values.pop()!;

export const push = dual<
  <A>(a: A) => (self: Stack<A>) => Stack<A>,
  <A>(self: Stack<A>, a: A) => Stack<A>
>(2, (self, a) => {
  self.values.push(a);
  return self;
});

export const pushAll = dual<
  <A>(as: A[] | undefined) => (self: Stack<A>) => Stack<A>,
  <A>(self: Stack<A>, as: A[] | undefined) => Stack<A>
>(2, (self, as) => {
  if (!as) {
    return self;
  }
  return Iterable.reduce(as.toReversed(), self, (z, a) => push(z, a));
});

export const pushAllInto = dual<
  <A>(s: Stack<A>) => (as: A[] | undefined) => Stack<A>,
  <A>(as: A[] | undefined, s: Stack<A>) => Stack<A>
>(2, (as, self) => pushAll(self, as));
