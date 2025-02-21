
export type Type<A> = A | A[];

export const isChild = <A>(children: Type<A>): children is A => !Array.isArray(children);

export const isChildren = <A>(children: Type<A>): children is A[] => Array.isArray(children);

export const isEmpty = <A>(children: Type<A>): boolean => !children;

export const normalize = <A>(children: Type<A>): A[] => isChild(children) ? [children] : children;
