import {FRAGMENT, INTERNAL_ERROR, INTRINSIC, IS_DEV, TEXT_NODE} from '#src/disreact/model/internal/core/constants.ts';
import type * as Event from '#src/disreact/model/internal/event.ts';
import * as Lateral from '#src/disreact/model/internal/core/lateral.ts';
import * as Lineage from '#src/disreact/model/internal/core/lineage.ts';
import type * as Document from '#src/disreact/model/internal/document.ts';
import type { UpdateError} from '#src/disreact/model/internal/infrastructure/dispatch.ts';
import type {RenderError} from '#src/disreact/model/internal/infrastructure/dispatch.ts';
import * as dispatch from '#src/disreact/model/internal/infrastructure/dispatch.ts';
import * as Jsx from '#src/disreact/model/internal/infrastructure/jsx.ts';
import * as proto from '#src/disreact/model/internal/infrastructure/proto.ts';
import * as Polymer from '#src/disreact/model/internal/polymer.ts';
import * as E from 'effect/Effect';
import {dual, pipe} from 'effect/Function';
import type * as Inspectable from 'effect/Inspectable';
import * as Pipeable from 'effect/Pipeable';

export type Node = | Text
                   | Fragment
                   | Intrinsic
                   | Functional;

interface Base extends Pipeable.Pipeable,
  Inspectable.Inspectable,
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

const convertWithin = <A extends Node>(self: A): A => {
  if (self.child) {
    self.valence = [convertChild(self, self.child, self.d, 0)];
  }
  else if (self.childs) {
    self.valence = convertChilds(self, self.childs);
  }
  return self;
};

export const valence = (self: Node): Node[] | undefined => self.valence;

export const valenceR = (self: Node): Node[] | undefined => self.valence?.toReversed();

export const render__ = (self: Node, d: Document.Document<Node>) => {
  switch (self._tag) {
    case TEXT_NODE: {
      return E.succeed(undefined);
    }
    case FRAGMENT:
    case INTRINSIC: {
      return E.sync(() => {
        convertWithin(self);
        return self.valence;
      });
    }
  }
  return dispatch.render(self, d);
};
export const render = dual<(d: Document.Document<Node>) => (self: Node) => E.Effect<Node[] | undefined>, typeof render__>(2, render__);

export const update__ = (self: Node, d: Document.Document<Node>): E.Effect<Node, UpdateError> => {
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
    dispatch.runAllFx(self.polymer!),
    E.as(self),
  );
};
export const update = dual<(d: Document.Document<Node>) => (self: Node) => E.Effect<Node, UpdateError>, typeof update__>(2, update__);

export const mount__ = (self: Node, d: Document.Document<Node>): E.Effect<Node, RenderError | UpdateError> => {
  switch (self._tag) {
    case TEXT_NODE: {
      return E.succeed(self);
    }
    case FRAGMENT:
    case INTRINSIC: {
      return E.sync(() => {
        convertWithin(self);
        return self;
      });
    }
  }
  return pipe(
    E.sync(() => {
      self.polymer = Polymer.empty();
    }),
    E.andThen(dispatch.render(self, d)),
    E.map((cs) => {
      self.valence = convertChildren(self, cs);
      return self;
    }),
  );
};
export const mount = dual<(d: Document.Document<Node>) => (self: Node) => E.Effect<Node, RenderError | UpdateError>, typeof mount__>(2, mount__);

export const hydrate__ = (self: Node, d: Document.Document<Node>): E.Effect<Node, RenderError> => {
  switch (self._tag) {
    case TEXT_NODE: {
      return E.succeed(self);
    }
    case FRAGMENT:
    case INTRINSIC: {
      return E.sync(() => {
        convertWithin(self);
        return self;
      });
    }
  }
  return pipe(
    E.sync(() => {
      if (IS_DEV && !self.$trie) {
        throw new Error();
      }
      if (IS_DEV && !self.polymer) {
        throw new Error();
      }
      if (self.$trie! in d.trie) {
        self.polymer = Polymer.rehydrate(d.trie[self.$trie!]);
        delete d.trie[self.$trie!];
      }
      else {
        self.polymer = Polymer.empty();
      }
    }),
    E.andThen(dispatch.render(self, d)),
    E.map((cs) => {
      self.valence = convertChildren(self, cs);
      return self;
    }),
  );
};
export const hydrate = dual<(d: Document.Document<Node>) => (self: Node) => E.Effect<Node, RenderError>, typeof hydrate__>(2, hydrate__);

export const unmount__ = (self: Node, d: Document.Document<Node>): E.Effect<Node> => E.suspend(() => {
  if (isFunctional(self)) {
    delete (self as any).polymer;
  }
  delete self.valence;
  return E.succeed(self);
});
export const unmount = dual<(d: Document.Document<Node>) => (self: Node) => E.Effect<Node>, typeof unmount__>(2, unmount__);

export const dehydrate__ = (self: Node, d: Document.Document<Node>): Node[] | undefined => {
  if (isFunctional(self)) {
    if (IS_DEV && !self.$trie) {
      throw new Error(INTERNAL_ERROR);
    }
    if (IS_DEV && self.$trie! in d.trie) {
      throw new Error(INTERNAL_ERROR);
    }
    if (IS_DEV && !self.polymer) {
      throw new Error(INTERNAL_ERROR);
    }
    d.trie[self.$trie!] = self.polymer!.stack;
  }
  return self.valence;
};
export const dehydrate = dual<(d: Document.Document<Node>) => (self: Node) => Node[] | undefined, typeof dehydrate__>(2, dehydrate__);

export const invoke__ = (self: Node, event: Event.Event) => {
  if (IS_DEV && !isIntrinsic(self)) {
    throw new Error(INTERNAL_ERROR);
  }
  const intrinsic = self as Intrinsic;

  return E.suspend(() => {
    return E.void;
  });
};
export const invoke = dual<(event: Event.Event) => (self: Node) => E.Effect<void>, typeof invoke__>(2, invoke__);
