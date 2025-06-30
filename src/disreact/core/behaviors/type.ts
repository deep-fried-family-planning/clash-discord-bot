import type * as E from 'effect/Effect';

export type IsEqual<A, B> = A extends B ? true : false;

export type IsAny<A> = boolean extends (IsEqual<A, never>) ? true : false;

export type IfAny<A, B, C> = IsAny<A> extends true ? B : C;

export type AnyEffect = E.Effect<any, any, any>;

export type UnifyM<A extends unknown[]> =
  A[number] extends AnyEffect
  ? E.Effect.AsEffect<A[number]>
  : A[number];

export type arr<A> = A[];

export type Arr<A> = Array<A>;

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export type Fn = Function;
