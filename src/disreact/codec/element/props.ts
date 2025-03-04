import {Data, Equal} from 'effect';

export type AnyProps = Record<string, any>;

export type Type<A> =
  | JustProps
  | Children<A>
  | Child<A>;

export type JustProps = AnyProps;
export type Child<A = any> = AnyProps & {children: A};
export type Children<A = any> = AnyProps & {children: A[]};

export const hasNoChildren = <A>(props: Type<A>): props is JustProps => !props.children;
export const hasChildren   = <A = any>(props: Type<A>): props is Children<A> => Array.isArray(props.children);
export const hasChild      = <A = any>(props: Type<A>): props is Child<A> => props.children;

export const isEqual = (a: AnyProps, b: AnyProps): boolean => {
  const cprops = Data.struct(a);
  const rprops = Data.struct(b);

  return Equal.equals(cprops, rprops);
};
