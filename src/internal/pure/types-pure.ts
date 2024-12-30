/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/no-empty-object-type */


export type num = number;
export type str = string;
export type und = undefined;
export type unk = unknown;
export type nul = null;
export type int = number;
export type bool = boolean;
export type n_bool =
  | 0
  | 1;
export type iso = string;
export type unix = number;
export type url = string;
export type alias = Record<str, str>;
export type ne = any;
export type neo = {};


export type opt<A> = { [k in keyof A]?: A[k] | und };
export type nopt<A> = { [k in keyof A]-?: A[k] | und };
export type ro<A> = { readonly [k in keyof A]: A[k] };
export type nro<A> = { -readonly [k in keyof A]: A[k] };
export type Immutable<A> = { readonly [k in keyof A]: A[k] };
export type Mutable<A> = { -readonly [k in keyof A]: A[k] };


export const ANY = <T>() => ({}) as T;


export type AnyKV = { [k in any]: any };
export type KV<T extends AnyKV = AnyKV> = { [k in keyof T]: T[k] };

export const tryOrDefault = <T>(fn: () => T, def: T): T => {
  try {
    return fn();
  }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  catch (e) {
    return def;
  }
};
