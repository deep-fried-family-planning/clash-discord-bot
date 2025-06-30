import type * as Diffable from '#src/disreact/core/behaviors/diffable.ts';
import * as Lateral from '#src/disreact/core/behaviors/lateral.ts';
import * as Lineage from '#src/disreact/core/behaviors/lineage.ts';
import type * as Document from '#disreact/core/primitives/exp/documentold.ts';
import type * as Polymer from '#src/disreact/core/primitives/polymer.ts';
import {FRAGMENT, FUNCTIONAL, INTRINSIC, IS_DEV, TEXT_NODE} from '#src/disreact/core/primitives/constants.ts';
import * as Diff from '#src/disreact/core/primitives/diff.ts';
import * as Diffs from '#src/disreact/core/primitives/diffs.ts';
import * as proto from '#src/disreact/core/behaviors/proto.ts';
import type * as type from '#src/disreact/core/behaviors/type.ts';
import * as FC from '#src/disreact/core/primitives/fc.ts';
import * as Jsx from '#src/disreact/runtime/jsx.tsx';
import * as Array from 'effect/Array';
import * as Equal from 'effect/Equal';
import {dual, pipe} from 'effect/Function';
import * as Inspectable from 'effect/Inspectable';
import * as Iterable from 'effect/Iterable';
import * as Option from 'effect/Option';
import * as Pipeable from 'effect/Pipeable';
import type * as P from 'effect/Predicate';

export type Nodev1 = | Text
                     | Fragment
                     | Intrinsic
                     | Functional;

interface Base extends Pipeable.Pipeable,
  Inspectable.Inspectable,
  Lineage.Lineage<Nodev1>,
  Lateral.Lateral<Nodev1>,
  Diffable.Diffable<Nodev1>,
  Polymer.Polymerizes
{
  $step?   : string;
  $trie?   : string;
  d        : number;
  i        : number;
  j        : number;
  n        : string;
  valence? : Nodev1[] | undefined;
  document?: Document.Documentold<Nodev1>;
}

export interface Text extends Base, Jsx.Text {}

export interface Fragment extends Base, Jsx.Fragment {}

export interface Intrinsic extends Base, Jsx.Intrinsic {}

export interface Functional extends Base, Jsx.Functional {}

export const isNode = (u: unknown): u is Nodev1 => Jsx.isJsx(u);

export const isText = (u: Nodev1): u is Text => Jsx.isText(u);

export const isFragment = (u: Nodev1): u is Fragment => Jsx.isFragment(u);

export const isIntrinsic = (u: Nodev1): u is Intrinsic => Jsx.isIntrinsic(u);

export const isFunctional = (u: Nodev1): u is Functional => Jsx.isFunctional(u);

const Prototype = proto.type<Nodev1>({
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
  ...Inspectable.BaseProto,
  toJSON() {
    switch (this._tag) {
      case TEXT_NODE: {
        return Inspectable.format({
          _id : 'Node',
          _tag: 'Text',
          text: this.component,
        });
      }
      case FRAGMENT: {
        return Inspectable.format({
          _id   : 'Node',
          _tag  : 'Fragment',
          childs: [...Array.ensure(this.valence)],
        });
      }
      case INTRINSIC: {
        return Inspectable.format({
          _id     : 'Node',
          _tag    : 'Intrinsic',
          name    : this.component,
          props   : this.props,
          children: [...Array.ensure(this.valence)],
        });
      }
      case FUNCTIONAL: {
        return Inspectable.format({
          _id     : 'Node',
          _tag    : 'Functional',
          name    : FC.name(this.component),
          props   : this.props,
          children: [...Array.ensure(this.valence)],
        });
      }
    }
  },
});

export const of = (j: Jsx.Child): Nodev1 => {
  if (Jsx.isJsx(j)) {
    return proto.init(Prototype, j);
  }
  return proto.init(Prototype, {
    _tag     : TEXT_NODE,
    component: j,
  });
};

export const makeRoot = (j: Jsx.Child): Nodev1 => {
  const v = of(j);
  v.$trie = `0:0:0:${v.n}`;
  v.$step = `0:0:0:${v.n}`;
  return v;
};

export const makeNode = dual<
  (j: Jsx.Child, d: number, i: number) => (parent: Nodev1) => Nodev1,
  (parent: Nodev1, j: Jsx.Child, d: number, i: number) => Nodev1
>(4, (parent, j, d, i) => {
  const v = of(j);
  v.j     = parent.i;
  v.i     = i;
  v.d     = d;
  Lineage.set(v, parent);
  return v;
});

export const makeValence = dual<
  (js: Jsx.Childs) => (parent: Nodev1) => Nodev1[],
  (parent: Nodev1, js: Jsx.Childs) => Nodev1[]
>(2, (parent, js) => {
  const depth = parent.d + 1;
  const acc   = [] as Nodev1[];
  let idx     = 0;

  for (let i = 0; i < js.length; i++) {
    const c = js[i];

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
  (self: Nodev1) => (cs: Jsx.Children) => Nodev1,
  (cs: Jsx.Children, self: Nodev1) => Nodev1
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

export const mountValence = <A extends Nodev1>(self: A): A => {
  if (self.childs) {
    self.valence = makeValence(self, self.childs);
    delete self.childs;
  }
  return self;
};

export const toValence = (self: Nodev1): Nodev1[] | undefined => self.valence?.toReversed();

export const dispose = <A extends Nodev1>(self: A): undefined => {
  delete self.valence;
  delete self.childs;
  delete self.document;
  return undefined;
};

export const attachDocument = dual<
  <A extends Nodev1>(document: Document.Documentold) => (self: A) => A,
  <A extends Nodev1>(self: A, document: Document.Documentold) => A
>(2, (self, document) => {
  self.document = document;
  return self;
});

export const attachPolymer = dual<
  <A extends Nodev1>(polymer: Polymer.Polymer) => (self: A) => A,
  <A extends Nodev1>(self: A, polymer: Polymer.Polymer) => A
>(2, (self, polymer) => {
  self.polymer = polymer;
  return self;
});

export const initialize = dual<
  (self: Nodev1) => (document: Document.Documentold) => Nodev1,
  (self: Nodev1, document: Document.Documentold) => Nodev1
>(2, (self, document) => {
  self.document = document;
  return self;
});

export const diff = dual<
  (other: Nodev1) => (self: Nodev1) => Diff.Diff<Nodev1>,
  (self: Nodev1, other: Nodev1) => Diff.Diff<Nodev1>
>(2, (self, other) => {
  if (self === other) {
    return Diff.skip();
  }
  if (self._tag !== other._tag) {
    return Diff.replace(other);
  }
  if (isText(self) || isText(other)) {
    if (self.component !== other.component) {
      return Diff.replace(other);
    }
    return Diff.skip();
  }
  if (isFragment(self) || isFragment(other)) {
    return Diff.cont(other);
  }
  if (isIntrinsic(self) || isIntrinsic(other)) {
    if (self.component !== other.component) {
      return Diff.replace(other);
    }
    if (!Equal.equals(self.props, other.props)) {
      return Diff.update(other);
    }
    return Diff.cont(other);
  }
  if (self.component !== other.component) {
    return Diff.replace(other);
  }
  if (!Equal.equals(self.props, other.props)) {
    return Diff.render(other.props);
  }
  if (!Equal.equals(self.polymer?.stack, self.polymer?.saved)) {
    return Diff.render(self.props);
  }
  return Diff.skip();
});

export const diffs = dual<
  (rs: Nodev1[]) => (self: Nodev1) => Diffs.Diffs<Nodev1>,
  (self: Nodev1, rs: Nodev1[]) => Diffs.Diffs<Nodev1>
>(2, (self, other) => {
  return Diffs.skip(); // todo
});

// todo
export const naiveLCA = (ns: Nodev1[]): Option.Option<Functional> => {
  const first = ns.at(0);

  if (!first) {
    return Option.none();
  }
  if (ns.length === 1) {
    if (isFunctional(first)) {
      return Option.some(first);
    }
    return pipe(
      Lineage.adjacency(first),
      Iterable.findFirst((a) => isFunctional(a)),
    );
  }

  throw new Error();
};

export const forEachValence = dual<
  <A>(f: (a: Nodev1) => A) => (self: Nodev1) => void,
  <A>(self: Nodev1, f: (a: Nodev1) => A) => void
>(2, (self, f) => {
  if (self.valence) {
    for (const v of self.valence) {
      f(v);
    }
  }
});

export const forEachValenceRight = dual<
  <A>(f: (a: Nodev1) => A) => (self: Nodev1) => void,
  <A>(self: Nodev1, f: (a: Nodev1) => A) => void
>(2, (self, f) => {
  if (self.valence) {
    for (const v of self.valence.toReversed()) {
      f(v);
    }
  }
});

export const foldValence = dual<
  <A>(z: A, f: (z: A, a: Nodev1) => A) => (self: Nodev1) => A,
  <A>(self: Nodev1, z: A, f: (z: A, a: Nodev1) => A) => A
>(3, (self, z, f) => {
  if (self.valence) {
    for (const v of self.valence) {
      z = f(z, v);
    }
  }
  return z;
});

export const foldValenceRight = dual<
  <A>(z: A, f: (z: A, a: Nodev1) => A) => (self: Nodev1) => A,
  <A>(self: Nodev1, z: A, f: (z: A, a: Nodev1) => A) => A
>(3, (self, z, f) => {
  if (self.valence) {
    for (const v of self.valence.toReversed()) {
      z = f(z, v);
    }
  }
  return z;
});

export const tap = dual<
  (f: (a: Nodev1) => void) => (self: Nodev1) => Nodev1,
  (self: Nodev1, f: (a: Nodev1) => void) => Nodev1
>(2, (self, f) => {
  f(self);
  return self;
});

export const use = dual<
  <A>(f: (a: Nodev1) => A) => (self: Nodev1) => A,
  <A>(self: Nodev1, f: (a: Nodev1) => A) => A
>(2, (self, f) => f(self));

type MO<A extends Nodev1, B, C> = {
  when: P.Refinement<Nodev1, A>;
  then: (n: A) => B;
  else: (n: Exclude<Nodev1, A>) => B;
};
export const when = dual<
  <A extends Nodev1, B, C>(m: MO<A, B, C>) => (self: Nodev1) => type.UnifyM<[B, B]>,
  <A extends Nodev1, B, C>(self: Nodev1, m: MO<A, B, C>) => type.UnifyM<[B, B]>
>(2, (self, m) => {
  if (m.when(self)) {
    return m.then(self) as any;
  }
  return m.else(self as any);
});

type MF<A, B> = {
  then: (n: Functional) => A;
  else: (n: Exclude<Nodev1, Functional>) => B;
};
export const matchFunctional = dual<
  <A, B>(m: MF<A, B>) => (self: Nodev1) => type.UnifyM<[A, B]>,
  <A, B>(self: Nodev1, m: MF<A, B>) => type.UnifyM<[A, B]>
>(2, (self, m) => {
  if (isFunctional(self)) {
    return m.then(self) as any;
  }
  return m.else(self);
});
