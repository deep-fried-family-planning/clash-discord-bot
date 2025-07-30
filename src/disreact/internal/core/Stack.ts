import * as Effect from 'effect/Effect';
import {dual} from 'effect/Function';
import * as Inspectable from 'effect/Inspectable';
import * as Option from 'effect/Option';
import * as Pipeable from 'effect/Pipeable';

export interface Stack<A, B> extends Inspectable.Inspectable,
  Pipeable.Pipeable
{
  state    : B;
  root     : A;
  values   : A[];
  push     : A[];
  pop      : A[];
  traversed: A[];
}

const StackProto: Stack<any, any> = {
  state    : undefined as any,
  root     : undefined as any,
  values   : undefined as any,
  push     : undefined as any,
  pop      : undefined as any,
  traversed: undefined as any,
  ...Pipeable.Prototype,
  ...Inspectable.BaseProto,
  toJSON() {
    return {
      _id  : 'Stack',
      state: this.state,
      size : this.values.length,
      items: this.values,
    };
  },
} as Stack<any, any>;

export const make = <A, B>(root: A): Stack<A, B> => {
  const self = Object.create(StackProto);
  self.root = root;
  self.values = [root];
  self.push = [];
  self.pop = [];
  self.traversed = [];
  return self;
};

export const makeWithState = dual<
  <A, B>(state: B) => (root: A) => Stack<A, B>,
  <A, B>(root: A, state: B) => Stack<A, B>
>(2, (root, state) => {
  const self = make<any, any>(root);
  self.state = state;
  return self;
});

export const state = <A, B>(self: Stack<A, B>) => self.state;

export const setState = dual<
  <A, B>(state: B) => (self: Stack<A, any>) => Stack<A, B>,
  <A, B>(self: Stack<A, any>, state: B) => Stack<A, B>
>(2, (self, state) => {
  self.state = state;
  return self;
});

export const modifyState = dual<
  <A, B, C>(f: (b: B) => C) => (self: Stack<A, B>) => Stack<A, C>,
  <A, B, C>(self: Stack<A, B>, f: (b: B) => C) => Stack<A, C>
>(2, (self, f) => {
  (self.state as any) = f(self.state);
  return self as any;
});

export const root = <A, B>(self: Stack<A, B>) => self.root;

export const dispose = <A, B>(self: Stack<A, B>) => {
  self.root = undefined as any;
  self.values = undefined as any;
  self.push = undefined as any;
  self.pop = undefined as any;
  self.traversed = undefined as any;
};

export const size = <A, B>(self: Stack<A, B>) => self.values.length;

export const condition = <A, B>(self: Stack<A, B>) => size(self) > 0;

export const peek = <A, B>(self: Stack<A, B>): A => self.values.at(-1)!;

export const peekOption = <A, B>(self: Stack<A, B>) => Option.fromNullable(peek(self));

export const pop = <A, B>(self: Stack<A, B>): A => self.values.pop()!;

export const popOption = <A, B>(self: Stack<A, B>) => Option.fromNullable(pop(self));

export const push = dual<
  <A, B>(a: A) => (self: Stack<A, B>) => Stack<A, B>,
  <A, B>(self: Stack<A, B>, a: A) => Stack<A, B>
>(2, (self, a) => {
  self.values.push(a);
  return self;
});

export const pushAll = dual<
  <A, B>(as: A[] | undefined) => (self: Stack<A, B>) => Stack<A, B>,
  <A, B>(self: Stack<A, B>, as: A[] | undefined) => Stack<A, B>
>(2, (self, as) => {
  if (!as) {
    return self;
  }
  for (let i = as.length - 1; i >= 0; i--) {
    push(self, as[i]);
  }
  return self;
});

export const tapPushAll = dual<
  <A, B>(as: A[] | undefined, f: (a: A, i: number, self: Stack<A, B>) => void) => (self: Stack<A, B>) => Stack<A, B>,
  <A, B>(self: Stack<A, B>, as: A[] | undefined, f: (a: A, i: number, self: Stack<A, B>) => void) => Stack<A, B>
>(3, (self, as, f) => {
  if (!as) {
    return self;
  }
  for (let i = as.length - 1; i >= 0; i--) {
    push(self, as[i]);
    f(as[i], i, self);
  }
  return self;
});

export const pushTo = dual<
  <A, B>(self: Stack<A, B>) => (a: A) => Stack<A, B>,
  <A, B>(a: A, self: Stack<A, B>) => Stack<A, B>
>(2, (a, self) =>
  push(self, a),
);

export const pushAllInto = dual<
  <A, B>(self: Stack<A, B>) => (as: A[] | undefined) => Stack<A, B>,
  <A, B>(as: A[] | undefined, self: Stack<A, B>) => Stack<A, B>
>(2, (as, self) =>
  pushAll(self, as),
);

export const pushToTapAll = dual<
  <A, B>(self: Stack<A, B>, f: (a: A, i: number) => void) => (as: A[] | undefined) => Stack<A, B>,
  <A, B>(as: A[] | undefined, self: Stack<A, B>, f: (a: A, i: number) => void) => Stack<A, B>
>(3, (as, self, f) => {
  if (!as) {
    return self;
  }
  for (let i = as.length - 1; i >= 0; i--) {
    push(self, as[i]);
    f(as[i], i);
  }
  return self;
});

export const storePassingSync = dual<
  <A, B>(f: (a: A, self: Stack<A, B>, state: B) => Stack<A, B>) => (self: Stack<A, B>) => Stack<A, B>,
  <A, B>(self: Stack<A, B>, f: (a: A, self: Stack<A, B>, state: B) => Stack<A, B>) => Stack<A, B>
>(2, (self, f) => {
  let s = self;

  while (condition(s)) {
    s = f(pop(s), s, s.state);
  }
  return s;
});

export const storePassing = dual<
  <A, B, E, R>(f: (a: A, self: Stack<A, B>, state: B) => Effect.Effect<Stack<A, B>, E, R>) => (self: Stack<A, B>) => Effect.Effect<Stack<A, B>, E, R>,
  <A, B, E, R>(self: Stack<A, B>, f: (a: A, self: Stack<A, B>, state: B) => Effect.Effect<Stack<A, B>, E, R>) => Effect.Effect<Stack<A, B>, E, R>
>(2, (self, f) =>
  Effect.iterate(self, {
    while: condition,
    body : (s) => f(pop(s), s, s.state),
  }),
);

export const iterateSync = dual<
  <A, B>(f: (a: A, self: Stack<A, B>) => A[] | undefined | void) => (self: Stack<A, B>) => Stack<A, B>,
  <A, B>(self: Stack<A, B>, f: (a: A, self: Stack<A, B>) => A[] | undefined | void) => Stack<A, B>
>(2, (self, f) => {
  while (condition(self)) {
    const cur = pop(self);
    const opt = f(cur, self);
    pushAll(self, opt!);
  }
  return self;
});

export const iterateSyncWhile = dual<
  <A, B>(f: (pop: A, self: Stack<A, B>) => Option.Option<A[] | undefined>) => (self: Stack<A, B>) => Stack<A, B>,
  <A, B>(self: Stack<A, B>, f: (pop: A, self: Stack<A, B>) => Option.Option<A[] | undefined>) => Stack<A, B>
>(2, (self, f) => {
  while (condition(self)) {
    const cur = pop(self);
    const opt = f(cur, self);

    if (Option.isNone(opt)) {
      push(self, cur);
      break;
    }
    pushAll(self, opt.value);
  }
  return self;
});

export const as = dual<
  <A, B, C>(c: C) => (self: Stack<A, B>) => C,
  <A, B, C>(self: Stack<A, B>, c: C) => C
>(2, (self, c) => {
  dispose(self);
  return c;
});

export const iterate = dual<
  <A, B, E, R>(f: (a: A, self: Stack<A, B>) => Effect.Effect<A[] | undefined, E, R>) => (self: Stack<A, B>) => Effect.Effect<Stack<A, B>, E, R>,
  <A, B, E, R>(self: Stack<A, B>, f: (a: A, self: Stack<A, B>) => Effect.Effect<A[] | undefined, E, R>) => Effect.Effect<Stack<A, B>, E, R>
>(2, (self, f) =>
  Effect.iterate(self, {
    while: condition,
    body : (s) =>
      Effect.map(
        f(pop(s), s),
        pushAllInto(s),
      ),
  }),
);
