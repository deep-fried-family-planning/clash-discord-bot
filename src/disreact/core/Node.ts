import type * as Lateral from '#src/disreact/core/behaviors/lateral.ts';
import type * as Lineage from '#src/disreact/core/behaviors/lineage.ts';
import {FUNCTIONAL, INTRINSIC, type FRAGMENT, type LIST_NODE, type TEXT_NODE} from '#src/disreact/core/primitives/constants.ts';
import * as Polymer from '#src/disreact/core/Polymer.ts';
import type * as Document from '#src/disreact/core/Document.ts';
import * as Either from 'effect/Either';
import type * as Inspectable from 'effect/Inspectable';
import * as Option from 'effect/Option';
import type * as Pipeable from 'effect/Pipeable';
import type * as FC from '#src/disreact/core/FC.ts';
import * as Diff from '#src/disreact/core/primitives/diff.ts';
import * as Diffs from '#src/disreact/core/primitives/diffs.ts';

export type Node = | Text
                   | List
                   | Frag
                   | Rest
                   | Func;

export type Element = | Text
                      | List
                      | Frag
                      | Rest;

export type Renders = | Func;

export interface Base extends Pipeable.Pipeable, Inspectable.Inspectable, Lineage.Lineage<Node | Document.Document>, Lateral.Lateral<Node> {

  children?: Node[];
  document : Document.Document;
  polymer  : Polymer.Polymer;
  props    : any;
}

export interface Text extends Base {
  _tag     : typeof TEXT_NODE;
  component: string;
}

export interface List extends Base {
  _tag: typeof LIST_NODE;
}

export interface Frag extends Base {
  _tag: typeof FRAGMENT;
}

export interface Rest extends Base {
  _tag     : typeof INTRINSIC;
  component: string;
}

export interface Func extends Base {
  _tag     : typeof FUNCTIONAL;
  component: FC.Known;
}

export const isElement = (node: Node): node is Element => node._tag < FUNCTIONAL;

export const isRenders = (node: Node): node is Renders => node._tag > INTRINSIC;

export const diff = (self: Node, that: Node): Diff.Diff<Node> => {
  const right = Polymer.isChanged(self.polymer);
  return Diff.skip();
};

export const diffs = (self: Node, that: Node[]): Diffs.Diffs<Node> => {
  return Diffs.skip();
};

export const mount = (self: Node, document: Document.Document): Either.Either<Renders, Element> => {
  self.document = document;
  if (isElement(self)) {
    return Either.left(self);
  }
  return Either.right(self);
};

export const unmount = (self: Node, document: Document.Document) => {

};

export const hydrate = (self: Node, document: Document.Document): Either.Either<Renders, Element> => {
  self.document = document;
  if (isElement(self)) {
    return Either.left(self);
  }
  return Either.right(self);
};

export const dehydrate = (self: Node, document: Document.Document): Either.Either<Option.Option<Node[]>, Element> => {
  if (isElement(self)) {
    return Either.left(self);
  }
  return Either.right(Option.fromNullable(self.children));
};

export const lca = (ns: Node[]): Option.Option<Renders> => {
  return Option.none();
};
