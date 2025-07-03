import {IS_DEV} from '#disreact/core/immutable/constants.ts';
import type * as E from 'effect/Effect';
import * as Equal from 'effect/Equal';
import * as Hash from 'effect/Hash';

type DevErrorContext = {

};

export class DevError extends Error {
  _tag = 'DevError' as const;
  constructor(message: string) {
    super(message);
    this.name = 'DevError';
  }
}

export class FatalError extends Error {
  _tag = 'FatalError' as const;
  constructor(message: string) {
    super(message);
    this.name = 'FatalError';
  }
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export type Fn = Function;

export type FnN<A extends any[], B> = (...p: A) => B;

const async_constructor = (async () => {}).constructor;

export const LocalEffectTypeId = Symbol.for('effect/Effect');

export const isEffect = <A, E = never, R = never>(u: unknown): u is E.Effect<A, E, R> =>
  u !== null
  && typeof u === 'object'
  && (u as any)[LocalEffectTypeId];

export const isAsync = <A extends any[], B>(u: FnN<A, B>): u is FnN<A, Extract<B, Promise<any>>> =>
  u.constructor === async_constructor;

const assignProto = (p: any, o: any) =>
  Object.assign(
    o,
    p,
  );

export const type = <A>(p: Partial<A>): A =>
  p as A;

export const tagged = <A>(_tag: A) =>
  ({
    _tag,
  });

export const types = <A>(...ps: Partial<A>[]): A =>
  Object.assign(
    {},
    ...ps,
  );

export const declareArray = <A>(p: Partial<A>): A =>
  assignProto(
    Object.create(Array.prototype),
    p,
  );

export const init = <A>(p: A, o: Partial<A>): A =>
  Object.assign({}, p, o);

export const impure = <A>(p: A, o: Partial<A>): A =>
  Object.assign(o, p);

export const pure = <A>(p: any, o: Partial<A>): A => {
  const inst = impure(p, o);

  return IS_DEV
         ? Object.freeze(inst)
         : inst;
};

export const ensure = <A>(p: A): A => {
  if (IS_DEV) {
    if (typeof p !== 'object') {
      return p;
    }
    if (Array.isArray(p)) {
      return Object.freeze([...p].map(ensure)) as A;
    }
    return Object.freeze({...p});
  }
  return p;
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
