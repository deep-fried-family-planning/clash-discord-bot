import * as Lateral from '#src/disreact/model/internal/core/lateral.ts';
import * as Lineage from '#src/disreact/model/internal/core/lineage.ts';
import type * as Document from '#src/disreact/model/internal/document.ts';
import * as Pragma from '#src/disreact/model/internal/core/pragma.ts';
import type * as FC from '#src/disreact/model/internal/infrastructure/fc.ts';
import * as proto from '#src/disreact/model/internal/infrastructure/proto.ts';
import {dual} from 'effect/Function';
import * as Pipeable from 'effect/Pipeable';

export type Vertex = | Frag
                     | Text
                     | Rest
                     | Func;

const Type = Symbol.for('disreact/vertex');

interface Node extends Pipeable.Pipeable,
  Pragma.Pragma,
  Lateral.Lateral<Vertex>,
  Lineage.Lineage<Vertex>
  // Hash.Hash,
  // Equal.Equal,
  // Inspectable.Inspectable
{
  $step?  : string;
  $trie?  : string;
  [Type]  : typeof Type;
  depth   : number;
  idx     : number;
  idxp    : number;
  pass    : number;
  valence?: Vertex[];
  z?      : Document.Document<Vertex>;
}

const Base = proto.declare<Node>({
  $step    : '' as string,
  $trie    : '' as string,
  [Type]   : Type,
  component: undefined as any,
  depth    : 0 as number,
  idx      : 0 as number,
  idxp     : 0 as number,
  props    : undefined as any,
  pass     : 0 as number,
  valence  : undefined as any,
  ...Pipeable.Prototype,
  ...Lineage.Prototype,
  ...Lateral.Prototype,
  // ...Inspectable.BaseProto,
});


export interface Text extends Node {
  _tag     : typeof Pragma.TEXT;
  component: Pragma.Text;
}
const Text = proto.declare<Text>({
  ...Base,
  _tag: Pragma.TEXT,
});

export interface Frag extends Node {
  _tag   : typeof Pragma.FRAG;
  valence: Vertex[];
}
const Frag = proto.declare<Frag>({
  ...Base,
  _tag: Pragma.FRAG,
});

export interface Rest extends Node {
  _tag     : typeof Pragma.REST;
  component: string;
  props    : any;
}
const Rest = proto.declare<Rest>({
  ...Base,
  _tag: Pragma.REST,
});

export interface Func extends Node {
  _tag     : typeof Pragma.FUNC;
  component: FC.Known;
  props    : any;
  z        : Document.Document<Vertex>;
}
const Func = proto.declare<Func>({
  ...Base,
  _tag: Pragma.FUNC,
});

export const coerce = (j: Pragma.Child): Vertex => {
  if (typeof j !== 'object' || j === null) {
    const self = proto.instance(Text, {
      component: j,
    });
    delete self.props;
    delete self.valence;
    return self;
  }
  switch (j._tag) {
    case Pragma.REST: {
      const self = proto.instance(Rest, {
        component: j.component,
        props    : j.props,
      });
      return self;
    }
    case Pragma.FUNC: {
      const self = proto.instance(Func, {
        component: j.component,
        props    : j.props,
      });
      return self;
    }
  }
  const self = proto.instance(Frag, {});
  delete self.component;
  delete self.props;
  return self;
};

export const make = (p: Pragma.Text | Pragma.Pragma): Vertex => {
  const self = proto.instance(Base, {});

  if (typeof p !== 'object' || p === null) {
    self._tag = Pragma.TEXT;
    self.component = p;
    delete self.props;
    delete self.valence;
    return self as Vertex;
  }
  self._tag = p._tag;
  self.component = p.component;
  self.props = p.props;
  return self as Vertex;
};

const makeChild = (parent: Vertex, p: Pragma.Text | Pragma.Pragma, idx = 0): Vertex => {
  const child = make(p);
  Lineage.set(child, parent);
  child.depth = parent.depth + 1;
  child.idxp = parent.idx;
  child.idx = idx;
  return child;
};

type Rendered = Pragma.Text | Pragma.Pragma | (Pragma.Text | Pragma.Pragma)[];

export const fromRender = (parent: Vertex, ps: Rendered, accept?: boolean): Vertex[] => {
  if (!Array.isArray(ps)) {
    const children = [makeChild(parent, ps)];
    if (accept) {
      parent.valence = children;
    }
    return children;
  }
  switch (ps.length) {
    case 0: {
      return [];
    }
    case 1: {
      const children = [makeChild(parent, ps[0])];
      if (accept) {
        parent.valence = children;
      }
      return children;
    }
  }
  const children = [makeChild(parent, ps[0], 0)];

  for (let i = 1; i < ps.length; i++) {
    const before = children[i - 1];
    const child = makeChild(parent, ps[i], i);
    Lateral.setHead(before, child);
    Lateral.setTail(child, before);
    children.push(child);
  }
  if (accept) {
    parent.valence = children;
  }
  return children;
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
