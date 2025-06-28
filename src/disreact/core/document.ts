import type * as Hydrant from '#src/disreact/core/hydrant.ts';
import type * as Node from '#src/disreact/core/node.ts';
import type * as Polymer from '#src/disreact/core/polymer.ts';
import type {Page} from '#src/disreact/core/primitives/exp/page.ts';
import * as proto from '#src/disreact/core/primitives/proto.ts';
import type * as Stack from '#src/disreact/model/engine/stack.ts';
import * as FC from '#src/disreact/model/runtime/fc.ts';
import * as Jsx from '#src/disreact/model/runtime/jsx.tsx';
import {SortedMap} from 'effect';
import {dual, pipe} from 'effect/Function';
import * as iterable from 'effect/Iterable';
import type * as Mailbox from 'effect/Mailbox';
import * as Option from 'effect/Option';
import * as Pipeable from 'effect/Pipeable';
import type * as Record from 'effect/Record';
import type * as Trie from 'effect/Trie';
import type * as Ordered from 'effect/SortedMap';

const Id = Symbol.for('disreact/document');

export interface Document<A = Node.Node> extends Pipeable.Pipeable
{
  [Id]   : typeof Id;
  _hash  : string;
  _id    : string;
  _key   : string;
  _next  : string | null;
  _props : any;
  data   : any;
  flags  : Set<A>;
  page   : Page;
  hash?  : string;
  phase  : string;
  queue  : Mailbox.Mailbox<any>;
  root   : Node.Node;
  ptrie  : Record<string, Polymer.Chain>;
  known  : WeakSet<any>;
  hydrant: Hydrant.Hydrant;
  size   : number;
  triie  : Trie.Trie<Node.Node>;

  close(): void;
  next<P>(fc: FC.FC<P>, props: P): void;
  next(jsx: Jsx.Jsx, props?: undefined): void;
}

export const isDocument = <A>(u: unknown): u is Document<A> => typeof u === 'object' && u !== null && Id in u;

export const isClose = <A>(d: Document<A>) => d._next === null;

export const isSameSource = <A>(d: Document<A>) => d._id === d._next;

const Prototype = proto.type<Document>({
  [Id]: Id,
  size: 0,
  close() {
    this._next = null;
  },
  next(node: any, props: any) {
    if (FC.isFC(node)) {
      if (!props) {
        throw new Error(`Function component source requires props: ${node}`);
      }
      if (!props.source) {

      }
    }
    else if (Jsx.isJsx(node)) {

    }
    else {
      throw new Error(`Invalid source: ${node}`);
    }
  },
  ...Pipeable.Prototype,
});

export const make = (
  _id: string,
  _key: string,
  _hash: string,
  data: any,
  phase: string,
  queue: Mailbox.Mailbox<any>,
  root: Node.Node,
  trie: Record<string, Polymer.Chain> = {},
) =>
  proto.init(Prototype, {
    _id   : _id,
    _key  : _key,
    _hash : _hash,
    _next : _id,
    _props: {},
    data  : proto.ensure({...data}),
    flags : new Set(),
    phase : phase,
    queue : queue,
    root  : root,
    ptrie : trie,
  });

const setPhase = dual<
  <A>(phase: string) => (d: Document<A>) => Document<A>,
  <A>(d: Document<A>, phase: string) => Document<A>
>(2, (d, phase) => {
  d.phase = phase;
  return d;
});

export const isTrieEmpty = <A>(d: Document<A>) => Object.keys(d.ptrie).length === 0;

export const addTrie = dual<
  <A>(id: string, p: Polymer.Chain) => (d: Document<A>) => Document<A>,
  <A>(d: Document<A>, id: string, p: Polymer.Chain) => Document<A>
>(3, (d, id, p) => {
  d.ptrie[id] = p;
  return d;
});

export const getTrie = dual<
  <A>(id: string) => (d: Document<A>) => Option.Option<Polymer.Chain>,
  <A>(d: Document<A>, id: string) => Option.Option<Polymer.Chain>
>(2, (d, id) =>
  pipe(
    d.ptrie[id],
    Option.fromNullable,
    Option.map((p) => {
      delete d.ptrie[id];
      return p;
    }),
  ),
);

export const containsNode = dual<
  <A>(n: A) => (d: Document<A>) => boolean,
  <A>(d: Document<A>, n: A) => boolean
>(2, (d, n) => d.known.has(n));

export const recordNode = dual<
  <A>(n: A) => (d: Document<A>) => A,
  <A>(d: Document<A>, n: A) => A
>(2, (d, n) => {
  if (!containsNode(d, n)) {
    d.size++;
    d.known.add(n);
  }
  return n;
});

export const forgetNode = dual<
  <A>(n: A) => (d: Document<A>) => A,
  <A>(d: Document<A>, n: A) => A
>(2, (d, n) => {
  if (d.known.delete(n)) d.size--;
  return n;
});

export const isFlagged = dual<
  <A>(a: A) => (self: Document<A>) => boolean,
  <A>(self: Document<A>, a: A) => boolean
>(2, (self, a) => self.flags.has(a));

export const flag = dual<
  <A>(a: A) => (self: Document<A>) => Document<A>,
  <A>(self: Document<A>, a: A) => Document<A>
>(2, (self, a) => {
  self.flags.add(a);
  return self;
});

export const flagAll = dual<
  <A>(as: Iterable<A>) => (self: Document<A>) => Document<A>,
  <A>(self: Document<A>, as: Iterable<A>) => Document<A>
>(2, (self, as) =>
  iterable.reduce(as, self, (z, a) => flag(z, a)),
);

export const unflag = dual<
  <A>(a: A) => (self: Document<A>) => Document<A>,
  <A>(self: Document<A>, a: A) => Document<A>
>(2, (self, a) => {
  self.flags.delete(a);
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
