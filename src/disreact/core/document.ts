import type * as Node from '#src/disreact/core/node.ts';
import type * as Polymer from '#src/disreact/core/polymer.ts';
import {PHASE_INIT} from '#src/disreact/core/primitives/constants.ts';
import type {Page} from '#src/disreact/core/primitives/exp/page.ts';
import * as proto from '#src/disreact/core/primitives/proto.ts';
import type * as Stack from '#src/disreact/engine/stack.ts';
import * as FC from '#src/disreact/runtime/fc.ts';
import * as Jsx from '#src/disreact/runtime/jsx.tsx';
import {dual, pipe} from 'effect/Function';
import * as Iterable from 'effect/Iterable';
import type * as Mailbox from 'effect/Mailbox';
import * as Option from 'effect/Option';
import * as Pipeable from 'effect/Pipeable';
import * as Inspectable from 'effect/Inspectable';
import type * as Record from 'effect/Record';
import type * as Trie from 'effect/Trie';

const Id = Symbol.for('disreact/document');

export interface Hydrant {
  hash? : string;
  source: string | null;
  props : any;
  trie  : Record<string, Polymer.Chain>;
};

export interface Document<A = Node.Node> extends Pipeable.Pipeable,
  Inspectable.Inspectable
{
  [Id]     : typeof Id;
  data     : any;
  hydrantI : Hydrant;
  hydrantO : Hydrant;
  key      : string;
  nodes    : WeakSet<any>;
  outstream: Mailbox.Mailbox<any>;
  phase    : number;
  rerenders: Set<A>;
  root     : Node.Node;
  size     : number;
}

export const isDocument = <A>(u: unknown): u is Document<A> => typeof u === 'object' && u !== null && Id in u;

export const isClose = <A>(d: Document<A>) => d._next === null;

export const isSameSource = <A>(d: Document<A>) => d._id === d._next;

const Prototype = proto.type<Document>({
  [Id]: Id,
  size: 0,
  ...Pipeable.Prototype,
  ...Inspectable.BaseProto,
  toJSON() {
    return Inspectable.format({
      _id  : 'Document',
      key  : this.key,
      phase: this.phase,
      size : this.size,
      data : this.data,
      root : this.root,
    });
  },
});

export const make = (
  key: string,
  data: any,
  root: Node.Node,
  queue: Mailbox.Mailbox<any>,
) =>
  proto.init(Prototype, {
    data     : data,
    key      : key,
    phase    : PHASE_INIT,
    outstream: queue,
    rerenders: new Set(),
    root     : root,
  });

const setPhase = dual<
  <A>(phase: string) => (d: Document<A>) => Document<A>,
  <A>(d: Document<A>, phase: string) => Document<A>
>(2, (d, phase) => {
  d.phase = phase;
  return d;
});

export const isTrieEmpty = <A>(d: Document<A>) => Object.keys(d.trie).length === 0;

export const addTrie = dual<
  <A>(id: string, p: Polymer.Chain) => (d: Document<A>) => Document<A>,
  <A>(d: Document<A>, id: string, p: Polymer.Chain) => Document<A>
>(3, (d, id, p) => {
  d.trie[id] = p;
  return d;
});

export const getTrie = dual<
  <A>(id: string) => (d: Document<A>) => Option.Option<Polymer.Chain>,
  <A>(d: Document<A>, id: string) => Option.Option<Polymer.Chain>
>(2, (d, id) =>
  pipe(
    d.trie[id],
    Option.fromNullable,
    Option.map((p) => {
      delete d.trie[id];
      return p;
    }),
  ),
);

export const containsNode = dual<
  <A>(n: A) => (d: Document<A>) => boolean,
  <A>(d: Document<A>, n: A) => boolean
>(2, (d, n) => d.nodes.has(n));

export const recordNode = dual<
  <A>(n: A) => (d: Document<A>) => A,
  <A>(d: Document<A>, n: A) => A
>(2, (d, n) => {
  if (!containsNode(d, n)) {
    d.size++;
    d.nodes.add(n);
  }
  return n;
});

export const forgetNode = dual<
  <A>(n: A) => (d: Document<A>) => A,
  <A>(d: Document<A>, n: A) => A
>(2, (d, n) => {
  if (d.nodes.delete(n)) d.size--;
  return n;
});

export const isFlagged = dual<
  <A>(a: A) => (self: Document<A>) => boolean,
  <A>(self: Document<A>, a: A) => boolean
>(2, (self, a) => self.rerenders.has(a));

export const flag = dual<
  <A>(a: A) => (self: Document<A>) => Document<A>,
  <A>(self: Document<A>, a: A) => Document<A>
>(2, (self, a) => {
  self.rerenders.add(a);
  return self;
});

export const flagAll = dual<
  <A>(as: Iterable<A>) => (self: Document<A>) => Document<A>,
  <A>(self: Document<A>, as: Iterable<A>) => Document<A>
>(2, (self, as) =>
  Iterable.reduce(as, self, (z, a) => flag(z, a)),
);

export const unflag = dual<
  <A>(a: A) => (self: Document<A>) => Document<A>,
  <A>(self: Document<A>, a: A) => Document<A>
>(2, (self, a) => {
  self.rerenders.delete(a);
  return self;
});

export const tap = dual<
  <A>(f: (d: Document<A>) => void) => (d: Document<A>) => Document<A>,
  <A>(d: Document<A>, f: (d: Document<A>) => void) => Document<A>
>(2, (d, f) => {
  f(d);
  return d;
});

export const fromStack = <A>(stack: Stack.Stack<A>) =>
  pipe(
    stack.document,
    Option.fromNullable,
    Option.getOrThrow,
  );

export const fromPolymer = <A>(polymer: Polymer.Polymer<A>): Document<A> =>
  pipe(
    polymer.document?.deref(),
    Option.fromNullable,
    Option.getOrThrow,
  );

export const use = dual<
  <A, B>(f: (a: Document<A>) => B) => (d: Document<A>) => B,
  <A, B>(d: Document<A>, f: (a: Document<A>) => B) => B
>(2, (d, f) => f(d));

export const useFromStack = dual<
  <A, B>(f: (a: Document<A>) => B) => (s: Stack.Stack<A>) => B,
  <A, B>(s: Stack.Stack<A>, f: (a: Document<A>) => B) => B
>(2, (s, f) => f(s.document));
