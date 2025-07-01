import type * as Lateral from '#disreact/core/behaviors/lateral.ts';
import * as Lineage from '#disreact/core/behaviors/lineage.ts';
import type * as FC from '#disreact/core/FC.ts';
import {FRAGMENT, FUNCTIONAL, INTRINSIC, LIST_NODE, type NodeTag, TEXT_NODE} from '#disreact/core/immutable/constants.ts';
import * as Diff from '#disreact/core/immutable/diff.ts';
import * as Diffs from '#disreact/core/immutable/diffs.ts';
import * as internal from '#disreact/core/internal/node.ts';
import * as Polymer from '#disreact/core/Polymer.ts';
import * as Either from 'effect/Either';
import * as Equal from 'effect/Equal';
import {dual} from 'effect/Function';
import type * as Inspectable from 'effect/Inspectable';
import * as Option from 'effect/Option';
import type * as Pipeable from 'effect/Pipeable';

export type Node = | Text
                   | List
                   | Frag
                   | Rest
                   | Func;

export interface Base extends Pipeable.Pipeable, Inspectable.Inspectable, Lineage.Lineage<Node>, Lateral.Lateral<Node> {
  _tag     : NodeTag;
  source?  : string;
  children?: Node[] | undefined;
  rendered?: FC.Out;
  props    : any;
  trie     : string;
  step     : string;
  idx      : number;
  pdx      : number;
  depth    : number;
  name     : string;
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

export const isElement = (node: Node): node is Exclude<Node, Func> => node._tag < FUNCTIONAL;

export const isRenderable = (node: Node): node is Func => node._tag > INTRINSIC;

export const toEither = (self: Node): Either.Either<Func, Exclude<Node, Func>> => {
  if (isRenderable(self)) {
    return Either.right(self);
  }
  return Either.left(self);
};

export const connect = internal.connect;

export const renderedF = internal.connectRendered;

export const rendered = dual<
  (rendered: any) => (self: Node) => Node[],
  (self: Node, rendered: any) => Node[]
>(2, renderedF);

export const initializeF = (self: Func, polymer: Polymer.Polymer): Func => {
  self.polymer = polymer;
  return self;
};

export const dispose = internal.dispose;

export const diffF = (self: Node, that: Node): Diff.Diff<Node> => {
  switch (self._tag) {
    case TEXT_NODE: {
      if (that._tag !== TEXT_NODE) {
        return Diff.replace(that);
      }
      if (self.text !== that.text) {
        return Diff.replace(that);
      }
      return Diff.skip();
    }
    case LIST_NODE: {
      if (that._tag !== LIST_NODE) {
        return Diff.replace(that);
      }
      return Diff.cont(that);
    }
    case FRAGMENT: {
      if (that._tag !== FRAGMENT) {
        return Diff.replace(that);
      }
      return Diff.cont(that);
    }
    case INTRINSIC: {
      if (that._tag !== INTRINSIC) {
        return Diff.replace(that);
      }
      if (self.component !== that.component) {
        return Diff.replace(that);
      }
      if (!Equal.equals(self.props, that.props)) {
        return Diff.update(that);
      }
      return Diff.cont(that);
    }
    case FUNCTIONAL: {
      if (that._tag !== FUNCTIONAL) {
        return Diff.replace(that);
      }
      if (self.component !== that.component) {
        return Diff.replace(that);
      }
      if (!Equal.equals(self.props, that.props)) {
        return Diff.render(that.props);
      }
      if (Polymer.isChanged(self.polymer)) {
        return Diff.render(self.props);
      }
      return Diff.skip();
    }
  }
};

export const diff = dual<
  (that: Node) => (self: Node) => Diff.Diff<Node>,
  (self: Node, that: Node) => Diff.Diff<Node>
>(2, diffF);

export const diffsF = (self: Node, that?: Node[]): Diffs.Diffs<Node>[] => {
  const acc = [] as Diffs.Diffs<Node>[];

  if (!self.children && !that) {
    return [];
  }
  if (!self.children && that) {
    for (let i = 0; i < that.length; i++) {
      acc.push(Diffs.insert(that[i]));
    }
    return acc;
  }
  if (self.children && !that) {
    for (let i = 0; i < self.children.length; i++) {
      acc.push(Diffs.remove(self.children[i]));
    }
    return acc;
  }
  // todo
  return acc;
};

export const diffs = dual<
  (that: Node[]) => (self: Node) => Diff.Diff<Node>[],
  (self: Node, that: Node[]) => Diffs.Diffs<Node>[]
>(2, diffsF);

export const lca = (ns: Func[]): Option.Option<Func> => {
  if (ns.length === 0) {
    return Option.none();
  }
  if (ns.length === 1) {
    return Option.some(ns[0]);
  }

  return Option.none();
};

export const toChildrenReverse = (self: Node) => self.children?.toReversed();

export const findWithinF = <A extends Node>(self: Node, p: (n: Node) => n is A): Option.Option<A> => {
  const stack = [self] as Node[];

  while (stack.length) {
    const node = stack.pop()!;

    if (p(node)) {
      return Option.some(node);
    }
    if (node.children) {
      stack.push(...node.children.toReversed());
    }
  }
  return Option.none();
};

export const findWithin = dual<
  <A extends Node>(p: (n: Node) => n is A) => (self: Node) => Option.Option<A>,
  <A extends Node>(self: Node, p: (n: Node) => n is A) => Option.Option<A>
>(2, (self, p) => findWithinF(self, p));

export const findAboveF = <A extends Node>(self: Node, p: (n: Node) => n is A): Option.Option<A> => {
  let node = self;

  while (node) {
    if (p(node)) {
      return Option.some(node);
    }
    node = Lineage.get(node);
  }
  return Option.none();
};

export const findAbove = dual<
  <A extends Node>(p: (n: Node) => n is A) => (self: Node) => Option.Option<A>,
  <A extends Node>(self: Node, p: (n: Node) => n is A) => Option.Option<A>
>(2, (self, p) => findAboveF(self, p));
