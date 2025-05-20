/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import type * as Elem from '#src/disreact/mode/entity/elem.ts';
import * as Equal from 'effect/Equal';
import * as GlobalValue from 'effect/GlobalValue';
import * as Hash from 'effect/Hash';
import console from 'node:console';

export const symbol = Symbol.for('disreact/Deps/TypeId');

const fns = GlobalValue.globalValue(
  Symbol.for('disreact/Deps/Fns'),
  () => new WeakMap<object, Elem.Fn>(),
);

export declare namespace Deps {
  export interface Fn<P extends any[] = any[], O = any> extends Function {
    (...p: P): O;
    [symbol]: string;
    [Equal.symbol](that: Equal.Equal): boolean;
    [Hash.symbol](): number;
  }
}
export type Fn<P extends any[] = any[], O = any> = Deps.Fn<P, O>;

export const isFn = (fn: any): fn is Deps.Fn =>
  typeof fn === 'function' &&
  fn[symbol];

export const fnLink = (fn: Deps.Fn) => fns.get(fn);

export const fn = <P extends any[], O>(
  hook: string,
  link: Elem.Fn,
  input: (...p: P) => O,
): Deps.Fn<P, O> => {
  const fn = input as Deps.Fn<P, O>;

  fn[symbol] = hook;
  fn[Equal.symbol] = (that: Equal.Equal & Deps.Fn): boolean => {
    if (!isFn(that)) {
      return false;
    }
    return (
      Equal.equals(fn.name, that.name)
      && Equal.equals(fns.get(fn), fns.get(that as any))
    );
  };
  fn[Hash.symbol] = (): number => {
    return Hash.hash(hook);
  };

  fns.set(fn, link);
  return fn;
};

// const fn1 = () => {};
// const fn2 = (ope) => ope;
// const link1 = {};
// const link2 = {};
// const thing1 = make('useEffect', link1, () => {});
// const thing2 = make('useEffect', link2, () => {});
//
// console.log(Equal.equals(thing1, thing2));
