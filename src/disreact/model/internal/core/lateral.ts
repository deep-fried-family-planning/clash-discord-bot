import * as proto from '#src/disreact/model/internal/infrastructure/proto.ts';
import {globalValue} from 'effect/GlobalValue';
import * as P from 'effect/Predicate';

const HeadId = Symbol.for('disreact/head');
const TailId = Symbol.for('disreact/tail');

export interface Lateral<A = any> {
  [HeadId]: typeof TailId;
  __head<B extends A>(this: B): proto.IfAny<A, B | undefined, A | B | undefined>;
  __tail<B extends A>(this: B): proto.IfAny<A, B | undefined, A | B | undefined>;
}

export const isLateral = (u: unknown): u is Lateral =>
  P.hasProperty(u, HeadId)
  && u[HeadId] === TailId;

const hs = globalValue(HeadId, () => new WeakMap());
const ts = globalValue(TailId, () => new WeakMap());

export const isHead = (self: Lateral) => self.__head() === undefined;
export const isTail = (self: Lateral) => self.__tail() === undefined;
export const getHead = (self: WeakKey) => hs.get(self);
export const getTail = (self: WeakKey) => ts.get(self);
export const setHead = (self?: WeakKey, head?: WeakKey) => void (self && hs.set(self, head));
export const setTail = (self?: WeakKey, tail?: WeakKey) => void (self && ts.set(self, tail));

export const Prototype = proto.declare<Lateral>({
  [HeadId]: TailId,
  __head() {
    return getHead(this);
  },
  __tail() {
    return getTail(this);
  },
});

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
  const head = getHead(self);
  setHead(next, head); // self <-> head     next -> head
  setHead(self, next); // self  -> next  -> head
  setTail(next, self); // self <-> next  -> head
  setTail(head, next); // self <-> next <-> head
};

export const insertBefore = (self: WeakKey, next: WeakKey) => {
  const tail = getTail(self);
  setHead(next, self); // tail <-> self     next -> self
  setHead(tail, next); // tail  -> next  -> self
  setTail(self, next); // tail  -> next <-> self
  setTail(next, tail); // tail <-> next <-> self
};

export const remove = (self: WeakKey) => {
  const head = getHead(self);
  const tail = getTail(self);
  setHead(tail, head);
  setTail(head, tail);
};

export const adjacency = <A extends Lateral>(self: A): A[] => {
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
