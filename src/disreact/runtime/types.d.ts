declare namespace JSX {
  export type Element = symbol;

  export type ElementType = any;

  export type Elements = Element | Element[];

  export interface IntrinsicElements {}
}

declare module 'disreact' {
  import type * as E from 'effect/Effect';

  export type FCA = () => E.Effect<any>;

  namespace FCA {
    export type Inner = () => never;
  }
}
