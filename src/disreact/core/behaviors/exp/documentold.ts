import type * as Node from '#disreact/core/behaviors/exp/nodev1.ts';
import type * as Polymer from '#disreact/core/internal/polymer.ts';
import {type LifecyclePhase, PHASE_INIT} from '#disreact/core/immutable/constants.ts';
import * as proto from '#disreact/core/behaviors/proto.ts';
import type * as Stack from '#disreact/core/behaviors/exp/Stack.ts';
import {dual, pipe} from 'effect/Function';
import * as Inspectable from 'effect/Inspectable';
import * as Iterable from 'effect/Iterable';
import type * as Mailbox from 'effect/Mailbox';
import * as Option from 'effect/Option';
import * as Pipeable from 'effect/Pipeable';
import type * as Record from 'effect/Record';

export interface Hydrant {
  hash? : string;
  source: string | null;
  props : any;
  trie  : Record<string, Polymer.Chain>;
};

export interface Event {
  _tag  : string;
  prop  : string;
  target: any;
  data  : any;
}

export interface Documentold<A = Node.Nodev1> extends Pipeable.Pipeable,
  Inspectable.Inspectable
{
  data     : any;
  event?   : Event;
  hydrantI : Hydrant;
  hydrantO : Hydrant;
  key      : string;
  nodes    : WeakSet<any>;
  outstream: Mailbox.Mailbox<any>;
  phase    : LifecyclePhase;
  rerenders: Set<A>;
  root     : Node.Nodev1;
  size     : number;
}

const Prototype = proto.type<Documentold>({
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
  root: Node.Nodev1,
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

export const tap = dual<
  <A>(f: (d: Documentold<A>) => void) => (d: Documentold<A>) => Documentold<A>,
  <A>(d: Documentold<A>, f: (d: Documentold<A>) => void) => Documentold<A>
>(2, (d, f) => {
  f(d);
  return d;
});

export const use = dual<
  <A, B>(f: (a: Documentold<A>) => B) => (d: Documentold<A>) => B,
  <A, B>(d: Documentold<A>, f: (a: Documentold<A>) => B) => B
>(2, (d, f) => f(d));

const setPhase = dual<
  <A>(phase: LifecyclePhase) => (d: Documentold<A>) => Documentold<A>,
  <A>(d: Documentold<A>, phase: LifecyclePhase) => Documentold<A>
>(2, (d, phase) => {
  d.phase = phase;
  return d;
});

export const isFullyHydrated = <A>(d: Documentold<A>) =>
  Object.keys(d.hydrantI.trie).length === 0
    ? true
    : false;

export const hydrateChain = dual<
  <A>(id: string) => (d: Documentold<A>) => Option.Option<Polymer.Chain>,
  <A>(d: Documentold<A>, id: string) => Option.Option<Polymer.Chain>
>(2, (d, id) =>
  Option.fromNullable(d.hydrantI.trie[id]).pipe(
    Option.map((chain) => {
      delete d.hydrantI.trie[id];
      return chain;
    }),
  ),
);

export const dehydrateChain = dual<
  <A>(id: string, p: Polymer.Chain) => (d: Documentold<A>) => Documentold<A>,
  <A>(d: Documentold<A>, id: string, p: Polymer.Chain) => Documentold<A>
>(3, (d, id, chain) => {
  d.hydrantO.trie[id] = chain;
  return d;
});

export const containsNodeOption = dual<
  <A>(n: A) => (d: Documentold<A>) => Option.Option<A>,
  <A>(d: Documentold<A>, n: A) => Option.Option<A>
>(2, (d, n) =>
  d.nodes.has(n)
    ? Option.some(n)
    : Option.none(),
);

export const recordNode = dual<
  <A>(n: A) => (d: Documentold<A>) => A,
  <A>(d: Documentold<A>, n: A) => A
>(2, (d, n) =>
  containsNodeOption(d, n).pipe(
    Option.getOrElse(() => {
      d.nodes.add(n);
      d.size++;
      return n;
    }),
  ),
);

export const forgetNode = dual<
  <A>(n: A) => (d: Documentold<A>) => A,
  <A>(d: Documentold<A>, n: A) => A
>(2, (d, n) => {
  if (d.nodes.delete(n)) d.size--;
  return n;
});

export const isFlagged = dual<
  <A>(a: A) => (self: Documentold<A>) => boolean,
  <A>(self: Documentold<A>, a: A) => boolean
>(2, (self, a) => self.rerenders.has(a));

export const flag = dual<
  <A>(a: A) => (self: Documentold<A>) => Documentold<A>,
  <A>(self: Documentold<A>, a: A) => Documentold<A>
>(2, (self, a) => {
  self.rerenders.add(a);
  return self;
});

export const flagAll = dual<
  <A>(as: Iterable<A>) => (self: Documentold<A>) => Documentold<A>,
  <A>(self: Documentold<A>, as: Iterable<A>) => Documentold<A>
>(2, (self, as) =>
  Iterable.reduce(as, self, (z, a) => flag(z, a)),
);

export const unflag = dual<
  <A>(a: A) => (self: Documentold<A>) => Documentold<A>,
  <A>(self: Documentold<A>, a: A) => Documentold<A>
>(2, (self, a) => {
  self.rerenders.delete(a);
  return self;
});

export const fromStack = <A>(stack: Stack.Stack<A>) =>
  pipe(
    stack.document,
    Option.fromNullable,
    Option.getOrThrow,
  );

export const fromPolymer = <A>(polymer: Polymer.Polymer<A>): Documentold<A> =>
  pipe(
    polymer.document?.deref(),
    Option.fromNullable,
    Option.getOrThrow,
  );
