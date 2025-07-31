/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import type * as El from '#disreact/a/adaptor/element.ts';
import type * as Rehydrant from '#disreact/a/adaptor/envelope.ts';
import * as Array from 'effect/Array';
import * as Equal from 'effect/Equal';
import * as GlobalValue from 'effect/GlobalValue';
import * as Hash from 'effect/Hash';

export namespace Deps {}

export const TypeId = Symbol.for('disreact/dep'),
             HookId = Symbol.for('disreact/hook');

const upstream = GlobalValue
  .globalValue(Symbol.for('disreact/deps'), () => new WeakMap<El.Func | Rehydrant.Envelope, Set<El.Func>>());

export const get = (nd: El.Func) => {
  if (!upstream.has(nd)) {
    const deps = new Set<El.Func>();
    upstream.set(nd, deps);
    return deps;
  }
  return upstream.get(nd)!;
};

export const has = (n: El.Func, d: El.Func) => get(n).has(d);

export const add = (n: El.Func, d: El.Func) => get(n).add(d);

export const transfer = (n: El.Func, ds: Set<El.Func>) => {
  const deps = get(n);
  for (const d of ds) {
    deps.add(d);
  }
  ds.clear();
  return deps;
};

export const clear = (n: El.Func) => {
  const deps = get(n);
  deps.clear();
};

export const remove = (n: El.Func, d: El.Func) => get(n).delete(d);

export const set = (n: El.Func, ds: Set<El.Func>) => {
  const deps = get(n);
  deps.clear();
  for (const d of ds) {
    deps.add(d);
  }
  return deps;
};

const origins = GlobalValue
  .globalValue(Symbol.for('disreact/origins'), () => new WeakMap<any, El.Func>());

export const origin = (i: any) => origins.get(i);

const ObjProto = Object.assign(Object.create(Object.prototype), {
  [Hash.symbol]() {
    return Hash.structure(this);
  },
  [Equal.symbol](this: any, that: any) {
    if (!(TypeId in that) || that[TypeId] !== TypeId) {
      throw new Error('tsk tsk');
    }
    if (!Equal.equals(origins.get(this), origins.get(that))) {
      return false;
    }
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
  },
});

const ArrayProto = Object.assign(Object.create(global.Array.prototype), {
  [Hash.symbol]() {
    return Hash.array(this as any);
  },
  [Equal.symbol](this: any, that: any) {
    if (!(TypeId in that) || that[TypeId] !== TypeId) {
      throw new Error('tsk tsk');
    }
    if (!Equal.equals(origins.get(this), origins.get(that))) {
      return false;
    }
    if (!Array.isArray(that) || this.length !== that.length) {
      return false;
    }
    for (let i = 0; i < this.length; i++) {
      if (!Equal.equals(this[i], that[i])) {
        return false;
      }
    }
    return true;
  },
});

export type Item = any;

export const isItem = (i: any): i is Item => typeof i === 'object' && i !== null && i[TypeId] === TypeId;

export const item = <A>(hook: string, origin: El.Func, i: A): A => {
  if (i === null || i === undefined || typeof i !== 'object') {
    throw new Error();
  }
  if (Array.isArray(i)) {
    const arr = Object.setPrototypeOf(i, ArrayProto);
    arr[TypeId] = TypeId;
    arr[HookId] = hook;
    origins.set(arr, origin);
    return Object.freeze(arr);
  }
  const obj = Object.setPrototypeOf(i, ObjProto);
  obj[TypeId] = TypeId;
  obj[HookId] = hook;
  origins.set(obj, origin);
  return Object.freeze(obj);
};

const FnProto = Object.assign(Object.create(Function.prototype), {
  [Hash.symbol]() {
    return Hash.structure(this);
  },
  [Equal.symbol](this: any, that: any) {
    if (!(TypeId in that) || that[TypeId] !== TypeId) {
      throw new Error('tsk tsk');
    }
    if (!isFn(that)) {
      return false;
    }
    if (!Equal.equals(origins.get(this), origins.get(that))) {
      return false;
    }
    return true;
  },
});

export interface Fn extends Function {
  [TypeId]: string;
  (...p: any): any;
  [Equal.symbol](that: Equal.Equal): boolean;
  [Hash.symbol](): number;
}

export const isFn = (fn: any): fn is Fn => typeof fn === 'function' && fn[TypeId] === TypeId;

export const fn = <F extends (...p: any) => any>(hook: string, origin: El.Func, f: F): F => {
  const fn = Object.setPrototypeOf(f, FnProto);
  fn[TypeId] = TypeId;
  fn[HookId] = hook;
  origins.set(fn, origin);
  return fn;
};
