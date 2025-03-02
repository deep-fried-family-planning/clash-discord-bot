import {Data, Equal} from 'effect';

export type Just = Record<string, any>;

export type Child<A = any> = Just & {children: A};

export type Children<A = any> = Just & {children: A[]};

export type T<A> =
  | Just
  | Children<A>
  | Child<A>;

export const hasNoChildren = <A>(props: T<A>): props is Just => !props.children;

export const hasChildren = <A = any>(props: T<A>): props is Children<A> => Array.isArray(props.children);

export const hasChild = <A = any>(props: T<A>): props is Child<A> => props.children;

export const isEqual = (a: Just, b: Just): boolean => {
  const cprops = Data.struct(a);
  const rprops = Data.struct(b);
  return Equal.equals(cprops, rprops);
};
