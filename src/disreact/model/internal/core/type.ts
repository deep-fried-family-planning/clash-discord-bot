export type ProtoFn<A extends unknown[], B> = (...p: A) => B;

const __sync = () => {};

export const isMaybeSync = (x: any) => x.constructor === __sync.constructor;

const __async = async () => {};

export const isAsync = <
  A extends unknown[],
  B,
  C extends Extract<B, Promise<any>>,
>(
  u: ProtoFn<A, B>,
): u is ProtoFn<A, C> =>
  u.constructor === __async.constructor;

export type IsTF<A, B> = A extends B ? true : false;

export type IsAny<A> =
  boolean extends (A extends never
                   ? true
                   : false) ? true
                            : false;

export type IfAny<A, B, C> =
  IsAny<A> extends true
  ? B
  : C;
