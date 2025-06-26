import type * as Diffable from '#src/disreact/core/behaviors/diffable.ts';
import * as Lateral from '#src/disreact/core/behaviors/lateral.ts';
import * as Lineage from '#src/disreact/core/behaviors/lineage.ts';
import type * as Document from '#src/disreact/core/document.ts';
import type * as Polymer from '#src/disreact/core/polymer.ts';
import {IS_DEV, TEXT_NODE} from '#src/disreact/core/primitives/constants.ts';
import * as Diff from '#src/disreact/core/primitives/diff.ts';
import * as Diffs from '#src/disreact/core/primitives/diffs.ts';
import * as proto from '#src/disreact/core/primitives/proto.ts';
import type * as type from '#src/disreact/core/primitives/type.ts';
import * as Jsx from '#src/disreact/runtime/jsx.ts';
import * as E from 'effect/Effect';
import {dual} from 'effect/Function';
import type * as Inspectable from 'effect/Inspectable';
import * as Pipeable from 'effect/Pipeable';
import type * as P from 'effect/Predicate';

export type Node = | Text
                   | Fragment
                   | Intrinsic
                   | Functional;

interface Base extends Pipeable.Pipeable,
  Inspectable.Inspectable,
  Lineage.Lineage<Node>,
  Lateral.Lateral<Node>,
  Diffable.Diffable<Node>,
  Polymer.Polymerizes
{
  $step?  : string;
  $trie?  : string;
  d       : number;
  i       : number;
  j       : number;
  n       : string;
  valence?: Node[] | undefined;
  z?      : Document.Document<Node>;
}

export interface Text extends Base, Jsx.Text {}

export interface Fragment extends Base, Jsx.Fragment {}

export interface Intrinsic extends Base, Jsx.Intrinsic {}

export interface Functional extends Base, Jsx.Functional {}

export const isNode = (u: unknown): u is Node => Jsx.isJsx(u);

export const isText = (u: Node): u is Text => Jsx.isText(u);

export const isFragment = (u: Node): u is Fragment => Jsx.isFragment(u);

export const isIntrinsic = (u: Node): u is Intrinsic => Jsx.isIntrinsic(u);

export const isFunctional = (u: Node): u is Functional => Jsx.isFunctional(u);

const Prototype = proto.type<Node>({
  $step  : '',
  $trie  : '',
  d      : 0,
  i      : 0,
  j      : 0,
  n      : '',
  valence: undefined,
  ...Lineage.Prototype,
  ...Lateral.Prototype,
  ...Pipeable.Prototype,
});

export const decompose = <A extends Node>(self: A): undefined => {
  delete self.valence;
  delete self.childs;
  delete self.z;
  return undefined;
};

export const make = (j: Jsx.Child): Node => {
  if (Jsx.isJsx(j)) {
    return proto.init(Prototype, j);
  }
  return proto.init(Prototype, {
    _tag     : TEXT_NODE,
    component: j,
  });
};

export const makeRoot = (j: Jsx.Child): Node => {
  const v = make(j);
  v.$trie = `0:0:0:${v.n}`;
  v.$step = `0:0:0:${v.n}`;
  return v;
};

export const makeNode = dual<
  (c: Jsx.Child, d: number, i: number) => (parent: Node) => Node,
  (parent: Node, c: Jsx.Child, d: number, i: number) => Node
>(4, (parent, c, d, i) => {
  const v = make(c);
  v.j = parent.i;
  v.i = i;
  v.d = d;
  Lineage.set(v, parent);
  return v;
});

export const makeValence = dual<
  (cs: Jsx.Childs) => (parent: Node) => Node[],
  (parent: Node, cs: Jsx.Childs) => Node[]
>(2, (parent, cs) => {
  const depth = parent.d + 1;
  const acc = [] as Node[];
  let idx = 0;

  for (let i = 0; i < cs.length; i++) {
    const c = cs[i];

    if (!c) {
      continue;
    }
    if (IS_DEV && Array.isArray(c)) {
      throw new Error();
    }
    const head = makeNode(parent, c, depth, idx);
    const tail = acc[idx - 1];

    if (tail) {
      Lateral.setHead(tail, head);
      Lateral.setTail(head, tail);
    }
    acc.push(head);
    idx++;
  }
  return acc;
});

export const acceptJsxChildren = dual<
  (self: Node) => (cs: Jsx.Children) => Node,
  (cs: Jsx.Children, self: Node) => Node
>(2, (cs, self) => {
  if (!cs) {
    return self;
  }
  if (typeof cs !== 'object' || !Array.isArray(cs)) {
    self.childs = [cs];
    return self;
  }
  self.childs = cs;
  return self;
});

export const mountValence = <A extends Node>(self: A): A => {
  if (self.childs) {
    self.valence = makeValence(self, self.childs);
    delete self.childs;
  }
  return self;
};

export const toValence = (self: Node): Node[] | undefined => self.valence?.toReversed();

export const diff = dual<
  (other: Node) => (self: Node) => Diff.Diff<Node>,
  (self: Node, other: Node) => Diff.Diff<Node>
>(2, (self, other) => {
  return Diff.skip();
});

export const diffs = dual<
  (rs: Node[]) => (self: Node) => Diffs.Diffs<Node>,
  (self: Node, rs: Node[]) => Diffs.Diffs<Node>
>(2, (self, other) => {
  return Diffs.skip();
});

export const forEachValence = dual<
  <A>(f: (a: Node) => A) => (self: Node) => void,
  <A>(self: Node, f: (a: Node) => A) => void
>(2, (self, f) => {
  if (self.valence) {
    for (const v of self.valence) {
      f(v);
    }
  }
});

export const forEachValenceRight = dual<
  <A>(f: (a: Node) => A) => (self: Node) => void,
  <A>(self: Node, f: (a: Node) => A) => void
>(2, (self, f) => {
  if (self.valence) {
    for (const v of self.valence.toReversed()) {
      f(v);
    }
  }
});

export const foldValence = dual<
  <A>(z: A, f: (z: A, a: Node) => A) => (self: Node) => A,
  <A>(self: Node, z: A, f: (z: A, a: Node) => A) => A
>(3, (self, z, f) => {
  if (self.valence) {
    for (const v of self.valence) {
      z = f(z, v);
    }
  }
  return z;
});

export const foldValenceRight = dual<
  <A>(z: A, f: (z: A, a: Node) => A) => (self: Node) => A,
  <A>(self: Node, z: A, f: (z: A, a: Node) => A) => A
>(3, (self, z, f) => {
  if (self.valence) {
    for (const v of self.valence.toReversed()) {
      z = f(z, v);
    }
  }
  return z;
});

export const tap = dual<
  (f: (a: Node) => void) => (self: Node) => Node,
  (self: Node, f: (a: Node) => void) => Node
>(2, (self, f) => {
  f(self);
  return self;
});

export const use = dual<
  <A>(f: (a: Node) => A) => (self: Node) => A,
  <A>(self: Node, f: (a: Node) => A) => A
>(2, (self, f) => f(self));

type MO<A extends Node, B, C> = {
  when: P.Refinement<Node, A>;
  then: (n: A) => B;
  else: (n: Exclude<Node, A>) => C;
};
export const matchOnly = dual<
  <A extends Node, B, C>(m: MO<A, B, C>) => (self: Node) => type.UnifyM<[B, C]>,
  <A extends Node, B, C>(self: Node, m: MO<A, B, C>) => type.UnifyM<[B, C]>
>(2, (self, m) => {
  if (m.when(self)) {
    return m.then(self) as any;
  }
  return m.else(self as any);
});

type MF<A, B> = {
  then: (n: Functional) => A;
  else: (n: Exclude<Node, Functional>) => B;
};
export const matchFunctional = dual<
  <A, B>(m: MF<A, B>) => (self: Node) => type.UnifyM<[A, B]>,
  <A, B>(self: Node, m: MF<A, B>) => type.UnifyM<[A, B]>
>(2, (self, m) => {
  if (isFunctional(self)) {
    return m.then(self) as any;
  }
  return m.else(self);
});
