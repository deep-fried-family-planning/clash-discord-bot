import {IS_DEV} from '#src/disreact/core/primitives/constants.ts';
import {Equivalence} from 'effect';
import * as Equal from 'effect/Equal';
import * as Hash from 'effect/Hash';

export type proto = never;

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
