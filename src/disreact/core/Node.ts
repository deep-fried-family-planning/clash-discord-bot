import type * as Lateral from '#src/disreact/core/behaviors/lateral.ts';
import type * as Lineage from '#src/disreact/core/behaviors/lineage.ts';
import {FUNCTIONAL, INTRINSIC, type FRAGMENT, type LIST_NODE, type TEXT_NODE, type NodeTag} from '#src/disreact/core/primitives/constants.ts';
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

export type Renderable = | Func;

export interface Base extends Pipeable.Pipeable, Inspectable.Inspectable, Lineage.Lineage<Node | Document.Document>, Lateral.Lateral<Node> {
  _tag     : NodeTag;
  children?: Node[] | undefined;
  props    : any;
}

export interface Text extends Base {
  _tag: typeof TEXT_NODE;
  text: string;
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
  polymer  : Polymer.Polymer;
}

export const isElement = (node: Node): node is Exclude<Node, Renderable> => node._tag < FUNCTIONAL;

export const isRenderable = (node: Node): node is Renderable => node._tag > INTRINSIC;

export const make = (type: any, props: any): Node => {
  const self = type.make(props);
  self.props = props;
  return self;
};

export const clone = (self: Node): Node => {
  return self;
};

export const diff = (self: Node, that: Node): Diff.Diff<Node> => {
  const right = Polymer.isChanged(self.polymer);
  return Diff.skip();
};

export const diffs = (self: Node, that: Node[]): Diffs.Diffs<Node> => {
  return Diffs.skip();
};

export const initialize = (self: Node, document: Document.Document) => {
  return self;
};

export const initializeEither = (self: Node, document: Document.Document): Either.Either<Renderable, Node> => {
  if (isElement(self)) {
    return Either.left(self);
  }
  return Either.right(self);
};

export const mount = (self: Func, document: Document.Document) => {
  self.polymer = Polymer.mount(self);
  return self;
};

export const unmount = (self: Node, document: Document.Document) => {
  self.children = undefined;
  (self as any).polymer = undefined;
  (self as any).document = undefined;
  return self;
};

export const hydrate = (self: Func, document: Document.Document) => {

};

export const dehydrate = (self: Func, document: Document.Document): Either.Either<Option.Option<Node[]>, Node> => {
  if (isElement(self)) {
    return Either.left(self);
  }
  return Either.right(Option.fromNullable(self.children));
};

export const lca = (ns: Node[]): Option.Option<Renderable> => {
  return Option.none();
};
