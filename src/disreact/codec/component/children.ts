/* eslint-disable @typescript-eslint/no-redundant-type-constituents */

export type None =
  | undefined
  | null
  | false
  | never;

export type One<A> = A;

export type Many<A> = A[];

export type T<A> =
  | None
  | One<A>
  | Many<A>;

export const isNone    = <A>(children: T<A>): children is None => !children;
export const isOne     = <A>(children: T<A>): children is One<A> => !Array.isArray(children);
export const isMany    = <A>(children: T<A>): children is Many<A> => Array.isArray(children);
export const normalize = <A>(children: T<A>): A[] => isNone(children) ? [] : isOne(children) ? [children] : children;
