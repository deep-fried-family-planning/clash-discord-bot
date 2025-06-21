import * as Lateral from '#src/disreact/model/internal/core/lateral.ts';
import * as Lineage from '#src/disreact/model/internal/core/lineage.ts';
import * as Precursor from '#src/disreact/model/internal/core/exp/precursor.ts';
import type * as Valence from '#src/disreact/model/internal/core/exp/valence.ts';
import type * as FC from '#src/disreact/model/internal/infrastructure/fc.ts';
import * as proto from '#src/disreact/model/internal/infrastructure/proto.ts';
import type * as types from '#src/disreact/model/internal/infrastructure/type.ts';
import {Match, type Predicate} from 'effect';
import * as E from 'effect/Effect';
import {dual, flow} from 'effect/Function';
import * as Pipeable from 'effect/Pipeable';

const VertexId = Symbol.for('disreact/vertex');

  export interface Case<A, B> extends Vertex<Frag | Text | Rest | Func> {
    _tag     : A;
    component: B;
  }
  export type Cases = Frag | Text | Rest | Func;

export interface Vertex<A = Frag | Text | Rest | Func> extends Pipeable.Pipeable,
  Lineage.Lineage<A>,
  Lateral.Lateral<A>,
  Precursor.Precursor
{
  [VertexId]: typeof VertexId;
  $step?    : string;
  $trie?    : string;
  coors     : number[];
  valence?  : Valence.Valence<A> | undefined;
}

export const isVertex = (u: unknown): u is Vertex =>
  typeof u === 'object'
  && u !== null
  && VertexId in u
  && u[VertexId] === VertexId;

const Prototype = proto.declare<Vertex>({
  [VertexId]: VertexId,
  coors     : [],
  valence   : undefined,
  $step     : '',
  ...Pipeable.Prototype,
  ...Lineage.Prototype,
  ...Lateral.Prototype,
});

export type Frag = Case<typeof Precursor.Fragment, never>;
export type Text = Case<typeof Precursor.TEXT, Precursor.Primitive>;
export type Rest = Case<typeof Precursor.INTRINSIC, string>;
export type Func = Case<typeof Precursor.FUNCTION, FC.Known>;

export const isFrag = (u: Vertex): u is Frag => u._tag === Precursor.Fragment;

export const isRest = (u: Vertex): u is Rest => u._tag === Precursor.INTRINSIC;

export const isFunc = (u: Vertex): u is Func => u._tag === Precursor.FUNCTION;

export const isText = (u: Vertex): u is Text => u._tag === Precursor.TEXT;

export const valence = (v: Vertex): Valence.Valence => v.valence!;

export const fromPrecursor = (p: Precursor.Precursor): Vertex => {
  const self = proto.instance(Prototype, {
    ...p,
  });
  return self;
};

export const fromPrimitive = (p: Precursor.Primitive): Vertex => {
  const self = proto.instance(Prototype, {
    _tag     : Precursor.TEXT,
    component: p,
  });
  return self;
};

export const fromRender = (p: Precursor.Jsx | Precursor.Jsx[]): Vertex[] => {
  if (Precursor.isPrecursor(p)) {
    return [fromPrecursor(p)];
  }
  if (!p) {
    return [];
  }
  if (Array.isArray(p)) {
    return p.map((v) => fromRender(v));
  }
  return [fromPrimitive(p)];
};


type M<A, B, C, D> = {
  text: (n: Text) => A;
  frag: (v: Frag) => B;
  rest: (n: Rest) => C;
  func: (n: Func) => D;
};

export const match$ = <A, B, C, D>(v: Vertex, m: M<A, B, C, D>): types.UnifyM<[A, B, C, D]> => {
  switch (v._tag) {
    case Precursor.TEXT:
      return m.text(v as any) as types.UnifyM<[A, B, C, D]>;
    case Precursor.Fragment:
      return m.frag(v as any) as types.UnifyM<[A, B, C, D]>;
    case Precursor.INTRINSIC:
      return m.rest(v as any) as types.UnifyM<[A, B, C, D]>;
  }
  return m.func(v as any) as types.UnifyM<[A, B, C, D]>;
};

export const match = dual<
  <A, B, C, D>(m: M<A, B, C, D>) => (v: Vertex) => types.UnifyM<[A, B, C, D]>,
  typeof match$
>(2, match$);

type MF<A, B> = {
  func : (n: Func) => A;
  other: (n: Exclude<Vertex, Func>) => B;
};

export const matchFn$ = <A, B>(v: Vertex, m: MF<A, B>): types.UnifyM<[A, B]> => {
  if (isFunc(v)) {
    return m.func(v as any) as types.UnifyM<[A, B]>;
  }
  return m.other(v as any) as types.UnifyM<[A, B]>;
};

export const matchFn = dual<
  <A, B>(m: MF<A, B>) => (v: Vertex) => types.UnifyM<[A, B]>,
  typeof matchFn$
>(2, matchFn$);

type MJ<A extends Vertex, B, C> = {
  match: (v: A) => B;
  other: (v: Exclude<Cases, A>) => C;
};

export const matchOnly$ = <A extends Vertex, B, C>(v: Vertex, f: Predicate.Refinement<Vertex, A>, m: MJ<A, B, C>): types.UnifyM<[B, C]> => {
  if (f(v)) {
    return m.match(v as any) as types.UnifyM<[B, C]>;
  }
  return m.other(v as any) as types.UnifyM<[B, C]>;
};

export const matchOnly = dual<
  <A extends Vertex, B, C>(f: Predicate.Refinement<Vertex, A>, m: MJ<A, B, C>) => (v: Vertex) => types.UnifyM<[B, C]>,
  typeof matchOnly$
>(3, matchOnly$);

const typecheck3 = flow(
  matchOnly(isText, {
    match: (v) => E.fail(v),
    other: (v) => {
      throw new Error();
    },
  }),
  E.map((_) => _),
);

const typecheck = flow(
  match({
    text: () => E.succeed(true),
    frag: () => E.succeed(true),
    rest: () => E.succeed(true),
    func: () => E.fail(true),
  }),
  E.map((_) => _),
);

const typecheck2 = flow(
  matchFn({
    func : () => E.succeed(true),
    other: () => E.fail(true),
  }),
  E.map((_) => _),
);
