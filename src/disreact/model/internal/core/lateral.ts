import * as proto from '#src/disreact/model/internal/infrastructure/proto.ts';
import {INTERNAL_ERROR} from '#src/disreact/model/internal/infrastructure/proto.ts';
import {globalValue} from 'effect/GlobalValue';
import * as P from 'effect/Predicate';

const HeadId = Symbol.for('disreact/head'),
      TailId = Symbol.for('disreact/tail');

const hs = globalValue(HeadId, () => new WeakMap()),
      ts = globalValue(TailId, () => new WeakMap());

export interface Lateral<A = any> {
  [HeadId]: typeof TailId;
  __head<B extends A>(this: B): proto.IfAny<A, B | undefined, A | B | undefined>;
  __tail<B extends A>(this: B): proto.IfAny<A, B | undefined, A | B | undefined>;
}

export const isLateral = (u: unknown): u is Lateral =>
  P.hasProperty(u, HeadId)
  && u[HeadId] === TailId;

export const Prototype = proto.declare<Lateral>({
  [HeadId]: TailId,
  __head() {
    return getHead(this);
  },
  __tail() {
    return getTail(this);
  },
});

export const getHead = (self: WeakKey) => hs.get(self);

export const setHead = (self?: WeakKey, head?: WeakKey) => void (self && hs.set(self, head));

export const getTail = (self: WeakKey) => ts.get(self);

export const setTail = (self?: WeakKey, tail?: WeakKey) => void (self && ts.set(self, tail));

export const make = <A extends Lateral>(target: A, head?: A, tail?: A): A => {
  const self = proto.instance(Prototype, target);
  
  return self as A;
};

export const prepend = (self?: WeakKey, head?: WeakKey) => {
  setHead(self, head);
  setTail(head, self);
};

export const append = (self?: WeakKey, tail?: WeakKey) => {
  setHead(tail, self);
  setTail(self, tail);
};

export const insertAfter = (self: WeakKey, next: WeakKey) => {
  if (!next) {
    throw new Error(INTERNAL_ERROR);
  }
  const head = getHead(self);
  setHead(next, head); // self <-> head     next -> head
  setHead(self, next); // self  -> next  -> head
  setTail(next, self); // self <-> next  -> head
  setTail(head, next); // self <-> next <-> head
};

export const remove = (self: WeakKey) => {
  const head = getHead(self);
  const tail = getTail(self);
  setHead(tail, head);
  setTail(head, tail);
};

export const adjacency = <A extends WeakKey>(self: A): A[] => {
  const hs = [],
        ts = [];
  
  let h = self,
      t = self;
  
  while (h) {
    h = getTail(h);
    if (h) {
      hs.push(h);
    }
  }
  while (t) {
    t = getHead(t);
    if (t) {
      ts.unshift(t);
    }
  }
  return [...hs, self, ...ts] as A[];
  
  // const rest = [] as A[];
  //
  // let head    = self,
  //     current = head;
  //
  // while (current) { // [..., self, ...]
  //   current = getHead(current);
  //   if (current) {
  //     head = current; // [head, ...]
  //   }
  // }
  // while (head) { // [head, ...] -> rest
  //   rest.push(head);
  //   head = getTail(head);
  // }
};
