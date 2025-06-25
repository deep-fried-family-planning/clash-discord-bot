import {FRAGMENT, INTERNAL_ERROR, INTRINSIC, IS_DEV, TEXT_NODE} from '#src/disreact/model/internal/core/constants.ts';
import * as Lateral from '#src/disreact/model/internal/core/lateral.ts';
import * as Lineage from '#src/disreact/model/internal/core/lineage.ts';
import * as Document from '#src/disreact/model/internal/domain/document.ts';
import type * as Event from '#src/disreact/model/internal/domain/event.ts';
import * as Polymer from '#src/disreact/model/internal/domain/polymer.ts';
import type {RenderError, UpdateError} from '#src/disreact/model/internal/infrastructure/dispatch.ts';
import * as dispatch from '#src/disreact/model/internal/infrastructure/dispatch.ts';
import * as Jsx from '#src/disreact/model/internal/infrastructure/jsx.ts';
import * as proto from '#src/disreact/model/internal/infrastructure/proto.ts';
import type * as types from '#src/disreact/model/internal/infrastructure/type.ts';
import * as E from 'effect/Effect';
import {dual, pipe} from 'effect/Function';
import type * as Inspectable from 'effect/Inspectable';
import * as Option from 'effect/Option';
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

export const convertRoot = (j: Jsx.Child): Node => {
  const v = convert(j);
  v.$trie = `0:0:0:${v.n}`;
  v.$step = `0:0:0:${v.n}`;
  return v;
};

export const convert = (j: Jsx.Child): Node => {
  if (Jsx.isJsx(j)) {
    return proto.init(Prototype, j);
  }
  return proto.init(Prototype, {
    _tag     : TEXT_NODE,
    component: j,
  });
};

export const convertChild__ = (self: Node, c: Jsx.Child, d: number, i: number): Node => {
  const v = convert(c);
  v.j = self.i;
  v.i = i;
  v.d = d;
  Lineage.set(v, self);
  return v;
};
export const convertChild = dual<
  (c: Jsx.Child, d: number, i: number) => (self: Node) => Node,
  typeof convertChild__
>(4, convertChild__);

export const convertChilds__ = (self: Node, cs: Jsx.Childs): Node[] => {
  const depth = self.d + 1;

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
    const head = convertChild__(self, c, depth, idx);
    const tail = acc[idx - 1];
    if (tail) {
      Lateral.setHead(tail, head);
      Lateral.setTail(head, tail);
    }
    acc.push(head);
    idx++;
  }
  return acc;
};
export const convertChilds = dual<
  (cs: Jsx.Childs) => (self: Node) => Node[],
  typeof convertChilds__
>(2, convertChilds__);

export const convertChildren__ = (p: Node, cs: Jsx.Children): Node[] | undefined => {
  if (!cs) {
    return undefined;
  }
  if (typeof cs !== 'object' || !Array.isArray(cs)) {
    return [convertChild__(p, cs, p.d, 0)];
  }
  return convertChilds__(p, cs);
};
export const convertChildren = dual<
  (cs: Jsx.Children) => (self: Node) => Node[] | undefined,
  typeof convertChildren__
>(2, convertChildren__);

export const convertWithin = <A extends Node>(self: A): A => {
  if (self.childs) {
    self.valence = convertChilds(self, self.childs);
  }
  return self;
};

const assertTrie = (self: Node) => {
  if (IS_DEV) {
    if (!self.$trie) {
      throw new Error(INTERNAL_ERROR);
    }
  }
};

export const fx__ = (self: Node, document: Document.Document<Node>): E.Effect<Node> => {
  switch (self._tag) {
    case TEXT_NODE:
    case FRAGMENT:
    case INTRINSIC: {
      return E.succeed(self);
    }
  }
  if (IS_DEV && !self.polymer) {
    throw new Error(INTERNAL_ERROR);
  }
  return pipe(
    dispatch.update(self),
    E.as(self),
  );
};
export const fx = dual<
  (document: Document.Document<Node>) => (self: Node) => E.Effect<Node>,
  typeof fx__
>(2, fx__);

export const mount__ = (self: Node, document: Document.Document<Node>): E.Effect<Node> => {
  switch (self._tag) {
    case TEXT_NODE: {
      return E.succeed(self);
    }
    case FRAGMENT:
    case INTRINSIC: {
      return E.sync(() => convertWithin(self));
    }
  }
  return pipe(
    Polymer.empty(),
        Polymer.circular(self, document),
        Polymer.polymerize(self),
    dispatch.render,
    E.map((cs) => {
      self.valence = convertChildren__(self, cs);
      return self;
    }),
  );
};
export const mount = dual<
  (document: Document.Document<Node>) => (self: Node) => E.Effect<Node>,
  typeof mount__
>(2, mount__);

export const hydrate__ = (self: Node, document: Document.Document<Node>): E.Effect<Node> => {
  switch (self._tag) {
    case TEXT_NODE: {
      return E.succeed(self);
    }
    case FRAGMENT:
    case INTRINSIC: {
      return E.sync(() => {
        return convertWithin(self);
      });
    }
  }
  if (IS_DEV && !self.$trie) {
    throw new Error(INTERNAL_ERROR);
  }
  return document.pipe(
    Document.hydratePolymer(self.$trie!),
    Option.map((polymer) =>
      polymer.pipe(
        Polymer.circular(self, document),
        Polymer.polymerize(self),
        dispatch.render,
      ),
    ),
    Option.getOrElse(() =>
      pipe(
        Polymer.strictHydrate(),
        Polymer.circular(self, document),
        Polymer.polymerize(self),
        dispatch.render,
        E.tap(() => {}),
      ),
    ),
    E.map((cs) => {
      self.valence = convertChildren__(self, cs);
      return self;
    }),
  );
};
export const hydrate = dual<
  (document: Document.Document<Node>) => (self: Node) => E.Effect<Node>,
  typeof hydrate__
>(2, hydrate__);

export const unmount__ = (self: Node, document: Document.Document<Node>): E.Effect<void> => E.suspend(() => {
  delete self.valence;
  Polymer.decompose(self);
  return E.void;
});
export const unmount = dual<
  (document: Document.Document<Node>) => (self: Node) => E.Effect<void>,
  typeof unmount__
>(2, unmount__);

export const dehydrate__ = (self: Node, document: Document.Document<Node>): Node[] | undefined => {
  if (isFunctional(self)) {
    assertTrie(self);
    if (IS_DEV && self.$trie! in document.trie) {
      throw new Error(INTERNAL_ERROR);
    }
    if (IS_DEV && !self.polymer) {
      throw new Error(INTERNAL_ERROR);
    }
    document.trie[self.$trie!] = self.polymer!.stack;
  }
  return self.valence;
};
export const dehydrate = dual<
  (document: Document.Document<Node>) => (self: Node) => Node[] | undefined,
  typeof dehydrate__
>(2, dehydrate__);

export const invoke__ = (self: Node, event: Event.Event) => {
  if (IS_DEV && !isIntrinsic(self)) {
    throw new Error(INTERNAL_ERROR);
  }
  const intrinsic = self as Intrinsic;

  return E.suspend(() => {
    return E.void;
  });
};
export const invoke = dual<
  (event: Event.Event) => (self: Node) => E.Effect<void>,
  typeof invoke__
>(2, invoke__);

export const valence = (self: Node): Node[] | undefined => self.valence;

export const valenceRight = (self: Node): Node[] | undefined => self.valence?.toReversed();

export const childs = (self: Node): Jsx.Childs | undefined => self.cs;

export const childsRight = (self: Node): Jsx.Childs | undefined => self.cs?.toReversed();

export const map = dual<
  <A>(f: (a: Node) => A) => (self: Node) => A,
  <A>(self: Node, f: (a: Node) => A) => A
>(2, <A>(self: Node, f: (a: Node) => A) => f(self));

export const mapEffect = dual<
  <A, E, R, E2, R2>(f: (a: Node) => E.Effect<A, E, R>) => (self: E.Effect<Node, E2, R2>) => E.Effect<A, E | E2, R | R2>,
  <A, E, R, E2, R2>(self: E.Effect<Node, E2, R2>, f: (a: Node) => E.Effect<A, E, R>) => E.Effect<A, E | E2, R | R2>
>(
  2, <A, E, R, E2, R2>(self: E.Effect<Node, E2, R2>, f: (a: Node) => E.Effect<A, E, R>): E.Effect<A, E | E2, R | R2> => E.flatMap(self, f),
);

type MO<A extends Node, B, C> = {
  when: P.Refinement<Node, A>;
  then: (n: A) => B;
  else: (n: Exclude<Node, A>) => C;
};
export const matchOnly__ = <A extends Node, B, C>(self: Node, m: MO<A, B, C>): types.UnifyM<[B, C]> => {
  if (m.when(self)) {
    return m.then(self) as types.UnifyM<[B, C]>;
  }
  return m.else(self as any) as types.UnifyM<[B, C]>;
};
export const matchOnly = dual<
  <A extends Node, B, C>(m: MO<A, B, C>) => (self: Node) => types.UnifyM<[B, C]>,
  typeof matchOnly__
>(2, matchOnly__);
