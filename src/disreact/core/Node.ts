import * as Lateral from '#disreact/core/behaviors/lateral.ts';
import * as Lineage from '#disreact/core/behaviors/lineage.ts';
import type * as Document from '#disreact/core/Document.ts';
import type * as FC from '#disreact/core/FC.ts';
import * as Polymer from '#disreact/core/Polymer.ts';
import {FRAGMENT, FUNCTIONAL, INTRINSIC, LIST_NODE, type NodeTag, TEXT_NODE} from '#disreact/core/immutable/constants.ts';
import * as Diff from '#disreact/core/immutable/diff.ts';
import * as Diffs from '#disreact/core/immutable/diffs.ts';
import * as internal from '#disreact/core/internal/node.ts';
import * as Equal from 'effect/Equal';
import type * as Inspectable from 'effect/Inspectable';
import * as Option from 'effect/Option';
import type * as Pipeable from 'effect/Pipeable';

export type Node = | Text
                   | List
                   | Frag
                   | Rest
                   | Func;

export type Renderable = | Func;

export interface Base extends Pipeable.Pipeable, Inspectable.Inspectable, Lineage.Lineage<Node | Document.Document>, Lateral.Lateral<Node> {
  _tag     : NodeTag;
  source?  : string;
  children?: Node[] | undefined;
  props    : any;
  t        : string;
  s        : string;
  i        : number;
  p        : number;
  d        : number;
  n        : string;
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

export const trie = (self: Node) => `${self.d}:${self.p}:${self.i}:${self.n}`;

export const step = (self: Node) => `${self.d}:${self.p}:${self.i}:${self.n}`;

export const connectSingleRendered = (self: Node, child: any): Node[] => {
  if (!child._tag) {
    if (typeof child !== 'object') {
      child = internal.text(child);
    }
  }
  Lineage.set(child, self);
  (child as Node).d = self.d + 1;
  (child as Node).p = self.p;
  (child as Node).t = `${self.t}:${trie(child)}`;
  (child as Node).s = `${self.s}:${step(child)}`;
  return [child];
};

export const connectAllRendered = (self: Node, children: any[]): Node[] => {
  const depth = self.d + 1;
  const name = step(self);

  for (let i = 0; i < children.length; i++) {
    if (!children[i]._tag) {
      if (typeof children[i] !== 'object') {
        children[i] = internal.text(children[i]);
      }
      else {
        children[i] = internal.list(children[i]);
      }
    }
    const child = children[i] as Node;
    Lineage.set(child, self);
    if (children[i - 1]) {
      Lateral.setTail(child, children[i - 1]);
      Lateral.setHead(children[i - 1], child);
    }
    child.d = depth;
    child.i = i;
    child.p = self.p;
    child.t = `${self.t}:${trie(child)}`;
    child.s = `${name}:${step(child)}`;
  }
  return children;
};

export const connect = (self: Node) => {
  if (!self.children) {
    return self;
  }
  self.children = connectAllRendered(self, self.children);
  return self;
};

export const dispose = (self: Node) => {
  if (self._tag === FUNCTIONAL) {
    (self as any).polymer = undefined;
  }
  (self as any).children = undefined;
  (self as any).props = undefined;
};

export const diff = (self: Node, that: Node): Diff.Diff<Node> => {
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

export const diffs = (self: Node, that?: Node[]): Diffs.Diffs<Node>[] => {
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

export const lca = (ns: Renderable[]): Option.Option<Renderable> => {
  if (ns.length === 0) {
    return Option.none();
  }
  if (ns.length === 1) {
    return Option.some(ns[0]);
  }

  return Option.none();
};
