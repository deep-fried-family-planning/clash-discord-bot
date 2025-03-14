/* eslint-disable @typescript-eslint/no-namespace */



export namespace Children {
  export type Zero =
    | undefined
    | null
    | never[];

  export type Only<A> = A;

  export type Many<A> = A[];

  export type Any<A> =
    | Zero
    | Only<A>
    | Many<A>;

  export const isEmpty = <A>(self: Any<A>): self is Zero => !self;

  export const isOne = <A>(self: Any<A>): self is Only<A> => !Array.isArray(self);

  export const isMany = <A>(self: Any<A>): self is Many<A> => Array.isArray(self);

  export const normalize = <A>(self: Any<A>): A[] => {
    if (isEmpty(self)) {
      return [];
    }

    if (isOne(self)) {
      return [self];
    }

    return self;
  };
}
