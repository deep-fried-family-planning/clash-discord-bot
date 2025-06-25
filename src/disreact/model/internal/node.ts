import {FRAGMENT, INTRINSIC, IS_DEV, TEXT_NODE} from '#src/disreact/model/internal/core/constants.ts';
import * as Lateral from '#src/disreact/model/internal/core/lateral.ts';
import * as Lineage from '#src/disreact/model/internal/core/lineage.ts';
import type * as Document from '#src/disreact/model/internal/document.ts';
import * as dispatch from '#src/disreact/model/internal/infrastructure/dispatch.ts';
import * as proto from '#src/disreact/model/internal/infrastructure/proto.ts';
import * as Jsx from '#src/disreact/model/internal/core/jsx.ts';
import * as Polymer from '#src/disreact/model/internal/polymer.ts';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';
import * as Pipeable from 'effect/Pipeable';

export type Node = | Text
                   | Fragment
                   | Intrinsic
                   | Functional;

interface Base extends Pipeable.Pipeable,
  Lineage.Lineage<Node>,
  Lateral.Lateral<Node>
{
  $step?  : string;
  $trie?  : string;
  d       : number;
  i       : number;
  j       : number;
  n       : string;
  polymer?: Polymer.Polymer;
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

const Prototype = proto.declare<Node>({
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

const convertRoot = (j: Jsx.Child): Node => {
  const v = convert(j);
  v.$trie = `0:0:0:${v.n}`;
  v.$step = `0:0:0:${v.n}`;
  return v;
};

const convert = (j: Jsx.Child): Node => {
  if (Jsx.isJsx(j)) {
    return proto.init(Prototype, j);
  }
  return proto.init(Prototype, {
    _tag     : TEXT_NODE,
    component: j,
  });
};

const convertChild = (p: Node, c: Jsx.Child, d: number, i: number): Node => {
  const v = convert(c);
  v.j = p.i;
  v.i = i;
  v.d = d;
  Lineage.set(v, p);
  return v;
};

const convertChilds = (p: Node, cs: Jsx.Childs): Node[] => {
  const depth = p.d + 1;

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
    const head = convertChild(p, c, depth, idx);
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

const convertChildren = (p: Node, cs: Jsx.Children): Node[] | undefined => {
  if (!cs) {
    return undefined;
  }
  if (typeof cs !== 'object' || !Array.isArray(cs)) {
    return [convertChild(p, cs, p.d, 0)];
  }
  return convertChilds(p, cs);
};

const convertWithin = <A extends Node>(p: A): A => {
  if (p.child) {
    p.valence = [convertChild(p, p.child, p.d, 0)];
  }
  else if (p.childs) {
    p.valence = convertChilds(p, p.childs);
  }
  return p;
};

export const mount__ = (v: Node, d: Document.Document<Node>) => {
  switch (v._tag) {
    case TEXT_NODE: {
      return E.succeed(undefined);
    }
    case FRAGMENT:
    case INTRINSIC: {
      return E.sync(() => {
        convertWithin(v);
        return v.valence;
      });
    }
  }
  return pipe(
    E.sync(() => {
      v.polymer = Polymer.empty();
    }),
    E.andThen(dispatch.render(v, d)),
    E.map((cs) => {
      v.valence = convertChildren(v, cs);
      return v.valence;
    }),
  );
};

export const hydrate__ = (v: Node, d: Document.Document<Node>) => {
  switch (v._tag) {
    case TEXT_NODE: {
      return E.succeed(undefined);
    }
    case FRAGMENT:
    case INTRINSIC: {
      return E.sync(() => {
        convertWithin(v);
        return v.valence;
      });
    }
  }
  return pipe(
    E.sync(() => {
      if (IS_DEV && !v.$trie) {
        throw new Error();
      }
      if (IS_DEV && !v.polymer) {
        throw new Error();
      }
      if (v.$trie! in d.trie) {
        v.polymer = Polymer.rehydrate(d.trie[v.$trie!]);
        delete d.trie[v.$trie!];
      }
      else {
        v.polymer = Polymer.empty();
      }
    }),
    E.andThen(dispatch.render(v, d)),
    E.map((cs) => {
      v.valence = convertChildren(v, cs);
      return v.valence;
    }),
  );
};

export const rerender__ = (v: Node, d: Document.Document<Node>) => {

};

export const unmount__ = (v: Node, d: Document.Document<Node>) => E.suspend(() => {
  if (isFunctional(v)) {
    delete (v as any).polymer;
    delete v.valence;
    return E.void; // todo dismount fx
  }
  delete v.valence;
  return E.void;
});

export const dehydrate__ = (v: Node, d: Document.Document<Node>) => {
  if (isFunctional(v)) {
    if (IS_DEV && !v.$trie) {
      throw new Error();
    }
    if (IS_DEV && v.$trie! in d.trie) {
      throw new Error();
    }
    if (IS_DEV && !v.polymer) {
      throw new Error();
    }
    d.trie[v.$trie!] = v.polymer!.stack;
  }
  return v.valence;
};

export const invoke = (v: Node, e: any) => {
  if (!isIntrinsic(v)) {
    throw new Error();
  }
  return E.suspend(() => {
    return E.void;
  });
};
