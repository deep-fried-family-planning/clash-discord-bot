import type * as Lateral from '#disreact/core/behaviors/lateral.ts';
import type * as Lineage from '#disreact/core/behaviors/lineage.ts';
import type * as Document from '#disreact/core/Simulation.ts';
import type * as FC from '#disreact/core/FC.ts';
import {FRAGMENT, FUNCTIONAL, INTRINSIC, LIST_NODE, type NodeTag, TEXT_NODE} from '#disreact/core/immutable/constants.ts';
import * as Diff from '#disreact/core/immutable/diff.ts';
import * as Diffs from '#disreact/core/immutable/diffs.ts';
import * as internal from '#disreact/core/internal/node.ts';
import * as Polymer from '#disreact/core/Polymer.ts';
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

export interface Base extends Pipeable.Pipeable, Inspectable.Inspectable, Lineage.Lineage<Node | Document.Simulation>, Lateral.Lateral<Node> {
  _tag     : NodeTag;
  source?  : string;
  children?: Node[] | undefined;
  rendered?: FC.Out;
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

export const connectSelf = internal.connect;

export const connectRendered = internal.connectRendered;

export const dispose = (self: Node) => {
  if (self._tag === FUNCTIONAL) {
    (self.polymer as any) = undefined;
  }
  self.children = undefined;
  self.props = undefined;
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

export const toChildrenReverse = (self: Node) => self.children?.toReversed();
