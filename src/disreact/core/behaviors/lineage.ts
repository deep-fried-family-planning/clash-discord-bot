import {INTERNAL_ERROR} from '#src/disreact/core/primitives/constants.ts';
import * as proto from '#src/disreact/core/primitives/proto.ts';
import type * as type from '#src/disreact/core/primitives/type.ts';
import * as Eq from 'effect/Equal';
import {globalValue} from 'effect/GlobalValue';
import * as Hash from 'effect/Hash';
import * as Predicate from 'effect/Predicate';

const TypeId = Symbol.for('disreact/lineage');

const ls = globalValue(TypeId, () => new WeakMap());

export const get = (u: WeakKey) => ls.get(u);

export const set = <A>(u: A, o: WeakKey) => {
  ls.set(u as any, o);
  return u;
};

export interface Lineage<A = any> {
  [TypeId]: typeof TypeId;
  __lineage<B extends WeakKey>(this: B): type.IfAny<A, B | undefined, A | B | undefined>;
}
export namespace Lineage {
  export interface Equal<A = any> extends Lineage<A>, Hash.Hash, Eq.Equal {}
}

export const isLineage = (u: unknown): u is Lineage =>
  Predicate.hasProperty(u, TypeId)
  && u[TypeId] === TypeId;

export const Prototype: Lineage = {
  [TypeId]: TypeId,
  __lineage() {
    return get(this);
  },
};

export const make = <A extends Lineage>(target: A, origin: A): A => {
  const self = proto.init(Prototype, target);
  set(self, origin);
  return self as A;
};

export interface Equal<A = any> extends Lineage<A>,
  Hash.Hash,
  Eq.Equal
{}

export const strict = (a: unknown, b: unknown): boolean =>
  isLineage(a) &&
  isLineage(b) &&
  a.__lineage() === b.__lineage();

export const equals = (a: unknown, b: unknown): boolean =>
  isLineage(a) &&
  isLineage(b) &&
  Eq.equals(a.__lineage(), b.__lineage());

export const EqualPrototype: Equal = {
  ...Prototype,
  [Hash.symbol](this) {
    return Hash.structure(this);
  },
  [Eq.symbol](that) {
    return strict(this, that);
  },
};

export const makeEqual = <A extends (...p: any) => any>(f: A, origin: any): A => {
  const self = proto.init(EqualPrototype, f as any);
  set(self, origin);
  return self as unknown as A;
};

export const root = <A extends Lineage>(self: A): A => {
  let root = self;
  let current = root.__lineage();
  while (current) {
    root = current;
    current = current.__lineage();
  }
  return root;
};

export const adjacency = <A extends Lineage>(self?: A): Set<A> => {
  const ancestors = new Set<A>();

  if (!self) {
    return ancestors;
  }
  ancestors.add(self);

  let current = self.__lineage();

  while (current) {
    ancestors.add(current);
    current = current.__lineage();
  }
  return ancestors;
};

export const naiveLCA = <A extends Lineage>(ns: A[]): A | undefined => {
  if (!ns.length) {
    return undefined;
  }
  if (ns.length === 1) {
    return ns[0];
  }
  let lowest = ns.at(0);

  let ancestors = adjacency(lowest);

  for (let i = 1; i < ns.length; i++) {
    let current = ns.at(i);

    while (current) {
      if (ancestors.has(current)) {
        lowest = current;
        break;
      }
      current = current.__lineage();
    }
    if (!lowest) {
      throw new Error(INTERNAL_ERROR);
    }
  }
  (ancestors as any) = undefined;
  return lowest;
};
