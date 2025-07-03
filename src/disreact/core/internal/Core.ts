import {register} from '#disreact/core/internal/fc.ts';
import * as E from 'effect/Effect';
//
// type EffectFn<F, E, R> =
//   F extends Core.FC<any, infer E2, infer R2>
//   ? E.Effect<Core.Node, E | E2, R | R2>
//   : E.Effect<Core.Node, E, R>;

export namespace Core {
  type Primitive =
    | null
    | undefined
    | boolean
    | number
    | bigint
    | string;

  type Node<E = never, R = never> =
    | Primitive
    | Element
    | Element<any, FC<any, E, R>>
    | Iterable<Node>;

  export interface SyncFC<P = any> {
    (props: P): Node;
  }
  export interface AsyncFC<P = any> {
    (props: P): Promise<Node>;
  }
  export interface EffectFC<P = any, E = never, R = never> {
    (props: P): E.Effect<Node, E, R>;
  }
  export type FC<P = any, E = never, R = never> =
    | SyncFC<P>
    | AsyncFC<P>
    | EffectFC<P, E, R>;

  export type Endpoint<P = any, E = never, R = never> = {};

  export type Element<P = any, C extends string | FC<P, any, any> = string | FC<P, any, any>> = {
    component: C;
    props    : P;
    key?     : string | null | number | bigint | undefined;
  };

  export interface Event<D = any, T = any> {
    target: T;
    data  : D;
    close(): void;
    change<P>(component: FC<P>, props: P): void;
    change(element: Element): void;
  }
}

declare global {
  namespace JSX {
    export type ElementType<E, R> = | keyof IntrinsicElements
                                    | Core.FC<any, E, R>;

    export type Element = | string
                          | Core.Element;

    export interface IntrinsicElements {}
  }
}
