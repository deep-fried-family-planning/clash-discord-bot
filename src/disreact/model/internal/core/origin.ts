import * as Globals from '#src/disreact/model/internal/adaptors/globals.ts';
import * as Proto from '#src/disreact/model/internal/adaptors/prototype.ts';
import * as Equal from 'effect/Equal';
import * as Hash from 'effect/Hash';

export const TypeId = Symbol.for('disreact/origin');

export const symbol = Symbol.for('disreact/origin/symbol');

export type Origin<A extends object, B> = A & {
  [TypeId]: string;
  [symbol](this: A): B;
};

export const isOrigin = <A extends object, B>(o: any): o is Origin<A, B> =>
  typeof o === 'object' &&
  o !== null &&
  TypeId in o &&
  symbol in o;

export const get = <A extends object, B>(o: Origin<A, B>): B => o[symbol]();

export function getter<A extends object, B>(this: A): B | undefined {
  return Globals.getOrigin(this);
}

export const equals = <A extends object>(a: A, b: A): boolean =>
  isOrigin(a) &&
  isOrigin(b) &&
  a[symbol]() === b[symbol]();

const StructProto = {
  [symbol]: getter,
};

export const struct = <A extends object, B>(data: A, origin: B, type: string): A => {
  const self = Object.create(data);

  Globals.registerOrigin(self, origin);

  return Object.assign(self, StructProto);
};

const FunctionProto = {
  [symbol]: getter,
  [Hash.symbol]() {
    return 1;
  },
  [Equal.symbol](this: any, that: any) {
    return equals(this, that);
  },
};

export const fn = <A extends (...a: any) => any, B>(f: A, origin: B): A => {
  Globals.registerOrigin(f, origin);

  return Object.assign(f, FunctionProto);
};
