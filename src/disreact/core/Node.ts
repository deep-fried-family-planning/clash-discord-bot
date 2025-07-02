import type * as Lateral from '#disreact/core/behaviors/lateral.ts';
import * as Lineage from '#disreact/core/behaviors/lineage.ts';
import * as proto from '#disreact/core/behaviors/proto.ts';
import * as Document from '#disreact/core/Document.ts';
import * as FC from '#disreact/core/FC.ts';
import {ASYNC, EFFECT, FRAGMENT, FUNCTIONAL, INTRINSIC, LIST_NODE, type NodeTag, SYNC, TEXT_NODE} from '#disreact/core/immutable/constants.ts';
import * as Diff from '#disreact/core/immutable/diff.ts';
import * as Diffs from '#disreact/core/immutable/diffs.ts';
import * as internal from '#disreact/core/internal/node.ts';
import * as Polymer from '#disreact/core/Polymer.ts';
import * as E from 'effect/Effect';
import * as Either from 'effect/Either';
import * as Equal from 'effect/Equal';
import {dual} from 'effect/Function';
import type * as Inspectable from 'effect/Inspectable';
import * as Option from 'effect/Option';
import type * as Pipeable from 'effect/Pipeable';
import * as P from 'effect/Predicate';

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
  diff?    : Diff.Diff<Node>;
  diffs?   : Diffs.Diffs<Node>[];
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

export const isInvokable = (node: Node): node is Rest => node._tag === INTRINSIC;

export const isRenderable = (node: Node): node is Func => node._tag > INTRINSIC;

export const eitherRenderable = (self: Node): Either.Either<Func, Exclude<Node, Func>> => {
  if (isRenderable(self)) {
    return Either.right(self);
  }
  return Either.left(self);
};

export const toReversed = (self: Node) => self.children?.toReversed();

export const connect = internal.connect;

export const connectRenderedF = internal.connectRendered;

export const connectRendered = dual<
  <A extends Node>(rendered: any) => (self: A) => Node[],
  <A extends Node>(self: A, rendered: any) => Node[]
>(2, connectRenderedF);

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

export const initializeF = (self: Func, document: Document.Document): Func => {
  self.polymer = Polymer.empty(self, document);
  return self;
};

export const initialize = dual<
  (document: Document.Document) => (self: Func) => Func,
  (self: Func, document: Document.Document) => Func
>(2, initializeF);

export const hydrateF = (self: Func, document: Document.Document): Func => {
  self.polymer = document.pipe(
    Document.getEncoding(self.trie),
    Option.fromNullable,
    Option.map((encoded) => Polymer.hydrate(self, document, encoded)),
    Option.getOrElse(() => Polymer.empty(self, document)),
  );
  return self;
};

export const hydrate = dual<
  (document: Document.Document) => (self: Func) => Func,
  (self: Func, document: Document.Document) => Func
>(2, hydrateF);

export const commitF = (output: any, self: Func): Func => {
  Polymer.commit(self.polymer);
  if (Polymer.isStateless(self.polymer)) {
    FC.markStateless(self.component);
  }
  self.rendered = output;
  return self;
};

export const commit = dual<
  (self: Func) => (output: any) => Func,
  (output: any, self: Func) => Func
>(2, commitF);

export const accept = (self: Node) => {
  self.children = connectRendered(self, self.children);
  return self;
};

export const disposeF = (self: Node, document: Document.Document) => {
  if (isRenderable(self)) {
    Polymer.dispose(self.polymer);
    (self.polymer as any) = undefined;
  }
  (self.props as any) = undefined;
  (self.children as any) = undefined;
  (self.rendered as any) = undefined;
  (self.diff as any) = undefined;
  (self.diffs as any) = undefined;
  return self;
};

export const dispose = dual<
  (document: Document.Document) => (self: Node) => Node,
  (self: Node, document: Document.Document) => Node
>(2, disposeF);

import * as Fn from '#disreact/core/Fn.ts';

export const render = (self: Func) => {
  if (Fn.isStatelessFC(self.component)) {
    return Fn.renderStateless(self.component);
  }
  return Fn.render(self.component, self.props);
};

export const flush = (self: Func) => {
  return E.die('').pipe(E.as(self));
};

export const invokeDF = (self: Rest, event: any) => {
  return E.die('').pipe(E.as(self));
};

export const invoke = dual<
  (event: any) => (self: Rest) => E.Effect<Rest>,
  (self: Rest, event: any) => E.Effect<Rest>
>(2, invokeDF);
