
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
export type Fun = Function;

export type FnN<A extends unknown[], B> = (...p: A) => B;

type GetAsync<A> = Extract<A, Promise<any>>;

const __async = async () => {};

export const isAsync = <A extends unknown[], B>(u: FnN<A, B>): u is FnN<A, Extract<B, Promise<any>>> =>
  u.constructor === __async.constructor;
