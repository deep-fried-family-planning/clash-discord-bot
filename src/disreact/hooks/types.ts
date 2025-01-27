/* eslint-disable @typescript-eslint/no-explicit-any */

export type UseStateStack<A = any> = {s: A};

export const isStateStack = <A>(x: unknown): x is UseStateStack<A> =>
  !!x
  && typeof x === 'object'
  && 's' in x;
