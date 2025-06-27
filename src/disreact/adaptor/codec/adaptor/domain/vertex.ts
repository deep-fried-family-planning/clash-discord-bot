import * as Lateral from '#src/disreact/core/behaviors/lateral.ts';
import * as Lineage from '#src/disreact/core/behaviors/lineage.ts';
import type * as Document from '#src/disreact/core/document.ts';
import type * as FC from '#src/disreact/model/runtime/fc.ts';
import * as Pragma from '#src/disreact/adaptor/codec/adaptor/domain/pragma.ts';
import * as proto from '#src/disreact/core/primitives/proto.ts';
import {dual} from 'effect/Function';
import * as Pipeable from 'effect/Pipeable';

const Type = Symbol.for('disreact/vertex');

interface Node extends Pipeable.Pipeable,
  Pragma.Pragma,
  Lateral.Lateral<Vertex>,
  Lineage.Lineage<Vertex>
  // Hash.Hash,
  // Equal.Equal,
  // Inspectable.Inspectable
{
  $step?   : string;
  $trie?   : string;
  [Type]   : typeof Type;
  depth    : number;
  idx      : number;
  idxp     : number;
  pass     : number;
  valence? : Vertex[];
  document?: Document.Document<Vertex>;
}

const Traits = {
  ...Pipeable.Prototype,
  ...Lineage.Prototype,
  ...Lateral.Prototype,
};

export interface Text extends Node {
  _tag     : typeof Pragma.TEXT;
  component: Pragma.Text;
}

export interface Frag extends Node {
  _tag: typeof Pragma.FRAG;
}

export interface Rest extends Node {
  _tag     : typeof Pragma.REST;
  component: string;
  props    : any;
}

export interface Func extends Node {
  _tag     : typeof Pragma.FUNC;
  component: FC.Known;
  props    : any;
  document : Document.Document<Vertex>;
}

export type Vertex = | Frag
                     | Text
                     | Rest
                     | Func;

const Text = proto.type<Text>({
  [Type]   : Type,
  _tag     : Pragma.TEXT,
  component: undefined as any,
  ...Traits,
});

const Frag = proto.type<Frag>({
  $step  : '' as string,
  $trie  : '' as string,
  [Type] : Type,
  _tag   : Pragma.FRAG,
  depth  : 0 as number,
  idx    : 0 as number,
  idxp   : 0 as number,
  pass   : 0 as number,
  valence: undefined as any,
  ...Traits,
});

const Rest = proto.type<Rest>({
  $step    : '' as string,
  $trie    : '' as string,
  [Type]   : Type,
  _tag     : Pragma.REST,
  component: '' as string,
  depth    : 0 as number,
  idx      : 0 as number,
  idxp     : 0 as number,
  pass     : 0 as number,
  props    : undefined as any,
  valence  : undefined as any,
  ...Traits,
});

const Func = proto.type<Func>({
  $step    : '' as string,
  $trie    : '' as string,
  [Type]   : Type,
  _tag     : Pragma.FUNC,
  component: undefined as any,
  depth    : 0 as number,
  document : undefined as any,
  idx      : 0 as number,
  idxp     : 0 as number,
  pass     : 0 as number,
  props    : undefined as any,
  valence  : undefined as any,
  ...Traits,
});

export const makeText = (p: Pragma.Text): Vertex => {
  return proto.init(Text, {
    component: p,
  });
};

export const makeNode = (j: Pragma.Pragma): Vertex => {
  switch (j._tag) {
    case Pragma.REST: {
      return proto.init(Rest, {
        component: j.component,
        props    : j.props,
      });
    }
    case Pragma.FUNC: {
      return proto.init(Func, {
        component: j.component,
        props    : j.props,
      });
    }
  }
  return proto.init(Frag, {});
};

export const map$ = <A>(v: Vertex, f: (a: Vertex) => A) => f(v);

export const map = dual<<A>(f: (a: Vertex) => A) => (v: Vertex) => A, typeof map$>(2, map$);

export const modify$ = (v: Vertex, f: (a: Vertex) => void) => {
  f(v);
  return v;
};

export const modify = dual<(f: (a: Vertex) => void) => (v: Vertex) => Vertex, typeof modify$>(2, modify$);

export const tap$ = (v: Vertex, f: (a: Vertex) => void) => f(v);

export const tap = dual<(f: (a: Vertex) => void) => (v: Vertex) => Vertex, typeof tap$>(2, tap$);
