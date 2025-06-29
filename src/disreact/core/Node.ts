import * as Either from 'effect/Either';
import type * as Option from 'effect/Option';
import type * as Document from './document.ts';
import type * as node from './primitives/node';

export type Node = | node.Text
                   | node.List
                   | node.Frag
                   | node.Rest
                   | node.Func;

export type Element = | node.Text
                      | node.List
                      | node.Frag
                      | node.Rest;

export type Renders = | node.Func;

export const isElement = (node: Node): node is Element => node._tag < 5;

export const isRenders = (node: Node): node is Renders => node._tag > 4;

export const diff = (self: Node, that: Node) => {};

export const diffs = (self: Node, that: Node[]) => {};

export const lca = (ns: Node[]): Option.Option<Renders> => {};

export const initialize = (self: Node, document: Document.Document): Either.Either<Renders, Element> => {
  self.document = document;
  if (isElement(self)) {
    return Either.left(self);
  }
  return Either.right(self);
};

export const hydrate = (self: Node, document: Document.Document): Either.Either<Renders, Element> => {
  self.document = document;
  if (isElement(self)) {
    return Either.left(self);
  }
  return Either.right(self);
};

export const dehydrate = (self: Node, document: Document.Document): Either.Either<Element, Node[]> => {
  if (isElement(self)) {
    return Either.left(self);
  }
  return Either.right(self.children);
};
