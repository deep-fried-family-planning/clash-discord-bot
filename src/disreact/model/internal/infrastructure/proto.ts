import * as Equal from 'effect/Equal';

export type Proto = any;

export const isDEV = process.env.NODE_ENV === 'development';

export function structEquals(this: any, that: any): boolean {
  const selfKeys = Object.keys(this);
  const thatKeys = Object.keys(that);
  if (selfKeys.length !== thatKeys.length) {
    return false;
  }
  for (const key of selfKeys) {
    if (!(key in that) || !Equal.equals(this[key], that[key])) {
      return false;
    }
  }
  return true;
}

export function arrayEquals(this: any, that: any): boolean {
  if (this.length !== that.length) {
    return false;
  }
  for (let i = 0; i < this.length; i++) {
    if (!Equal.equals(this[i], that[i])) {
      return false;
    }
  }
  return true;
}

type Fn<A extends unknown[], B> = (...p: A) => B;

const syncFn = () => {};

const asyncFn = async () => {};

export const isMaybeSync = (x: any) => x.constructor === syncFn.constructor;

export const isAsync = <A extends unknown[], B, C extends Extract<B, Promise<any>>>(x: Fn<A, B>): x is Fn<A, C> =>
  x.constructor === asyncFn.constructor;

export const array = <A>(proto: Partial<A>): A =>
  assignProto(
    Object.create(Array.prototype),
    proto,
  );

export const struct = <A>(proto: Partial<A>): A =>
  proto as A;

const assignProto = (proto: any, obj: any) =>
  Object.assign(
    obj,
    proto,
  );

const setPrototype = (proto: any, obj: any) =>
  Object.setPrototypeOf(
    obj,
    proto,
  );

export const make = <A>(proto: Partial<A>): A =>
  proto as A;

export const extend = <A>(proto: any, obj: Partial<A>): A =>
  ({
    ...proto,
    ...obj,
  });

export const create = <A>(proto: A, obj: Partial<A>): A =>
  // setPrototype(proto, obj);
  Object.assign(obj, proto);

export const pure = <A>(proto: any, obj: Partial<A>): A =>
  isDEV
  ? Object.freeze(create(proto, obj))
  : create(proto, obj);
