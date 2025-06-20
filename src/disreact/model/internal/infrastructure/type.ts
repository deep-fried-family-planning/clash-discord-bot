import type * as E from 'effect/Effect';

export type IsEqual<A, B> =
  A extends B
  ? true
  : false;

export type IsAny<A> =
  boolean extends (IsEqual<A, never>)
  ? true
  : false;

export type IfAny<A, B, C> =
  IsAny<A> extends true
  ? B
  : C;

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export type Fn = Function;

export type FnN<A extends any[], B> = (...p: A) => B;

type GetAsync<A> = Extract<A, Promise<any>>;

const __async = async () => {};

export const isAsync = <A extends any[], B>(u: FnN<A, B>): u is FnN<A, Extract<B, Promise<any>>> =>
  u.constructor === __async.constructor;

export type DataFirst<A, B extends any[], C> = (data: A, ...p: B) => C;

export type DataLast<A, B extends any[], C> = (...p: B) => (data: A) => C;

export type DataLastFromFirst<A> =
  A extends DataFirst<infer A, infer B, infer C>
  ? DataLast<A, B, C>
  : never;

export type AnyEffect = E.Effect<any, any, any>;

export type type = never;

export type UnifyM<A extends unknown[]> =
  A[number] extends AnyEffect
  ? E.Effect.AsEffect<A[number]>
  : A[number];
