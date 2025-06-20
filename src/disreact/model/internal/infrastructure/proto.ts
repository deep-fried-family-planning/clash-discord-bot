import {Types} from 'effect';
import * as Equal from 'effect/Equal';
import * as Hash from 'effect/Hash';

export type Proto = never;

export const isDEV = (process.env.NODE_ENV === 'development') as true;

export const INTERNAL_ERROR = 'Internal Error';

const assignProto = (p: any, o: any) =>
  Object.assign(
    o,
    p,
  );

const setPrototype = (p: any, o: any) =>
  Object.setPrototypeOf(
    o,
    p,
  );

export const declare = <A>(p: Partial<A>): A => p as A;

export const declareTagged = <A>(_tag: A) => ({_tag});

export const declares = <A>(...ps: Partial<A>[]): A =>
  Object.assign({}, ...ps);

export const declareArray = <A>(p: Partial<A>): A =>
  assignProto(
    Object.create(Array.prototype),
    p,
  );

export const instance = <A>(p: A, o: Partial<A>): A =>
  Object.assign(o, p);

export const impure = <A>(p: A, o: Partial<A>): A =>
  Object.assign(o, p);

export const pure = <A>(p: any, o: Partial<A>): A => {
  const inst = impure(p, o);

  return isDEV
         ? Object.freeze(inst)
         : inst;
};

export const structHash = (self: any): number => Hash.structure(self);

export const structEquals = (self: any, that: any): boolean => {
  const selfKeys = Object.keys(self);
  const thatKeys = Object.keys(that);
  if (selfKeys.length !== thatKeys.length) {
    return false;
  }
  for (const key of selfKeys) {
    if (!(key in that) || !Equal.equals(self[key], that[key])) {
      return false;
    }
  }
  return true;
};

export const arrayHash = (self: any): number => Hash.array(self);

export const arrayEquals = (self: any, that: any): boolean => {
  if (self.length !== that.length) {
    return false;
  }
  for (let i = 0; i < self.length; i++) {
    if (!Equal.equals(self[i], that[i])) {
      return false;
    }
  }
  return true;
};

export type ProtoFn<A extends unknown[], B> = (...p: A) => B;

const __sync = () => {};

export const isMaybeSync = (x: any) => x.constructor === __sync.constructor;

const __async = async () => {};

export const isAsync = <
  A extends unknown[],
  B,
  C extends Extract<B, Promise<any>>,
>(
  u: ProtoFn<A, B>,
): u is ProtoFn<A, C> =>
  u.constructor === __async.constructor;

export type IsTF<A, B> = A extends B ? true : false;

export type IsAny<A> =
  boolean extends (A extends never
                   ? true
                   : false) ? true
                            : false;

export type IfAny<A, B, C> =
  IsAny<A> extends true
  ? B
  : C;
