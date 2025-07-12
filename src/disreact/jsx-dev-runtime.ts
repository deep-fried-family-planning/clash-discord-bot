import type {IntrinsicAttributesMap} from '#disreact/adaptor/codec/intrinsic/types.ts';
import * as Markup from '#disreact/model/Jsx.ts';
import type * as JsxRuntime from '#disreact/jsx-runtime.ts';
import type {Effect} from 'effect/Effect';

export const Fragment = Markup.Fragment,
             jsxDEV   = Markup.makeDEV;

declare global {
  export namespace JSX {
    //     export type ElementType = JsxRuntime.JsxElementType;
    //     // export type Element = JsxRuntime.JsxElement;
    //     export interface ElementAttributesProperty extends JsxRuntime.JsxElementAttributesProperty {}
    //     export interface ElementChildrenAttribute extends JsxRuntime.JsxElementChildrenAttribute {}
    //     export interface IntrinsicAttributes extends JsxRuntime.JsxIntrinsicAttributes {}
    //     export interface IntrinsicClassAttributes extends JsxRuntime.JsxIntrinsicClassAttributes {}
  }
}

declare global {
  namespace JSX {
    export interface EffectFC<A, E, R> {
      <E2, R2>(props: any): Effect<A, E | E2, R | R2>;
    }

    export type ElementType<A, E, R> =
      | EffectFC<A, E, R>;

    // export interface Element<E, R> extends Effect<Element<E, R>, E, R> {
    //   [Symbol.iterator]: any;
    // }

    export type Element<E, R> = Effect<Element<E, R>, E, R>;

    export interface ElementClass {}

    export interface ElementAttributesProperty {
      props: {};
    }

    export interface ElementChildrenAttribute<E, R> {
      children: {};
    }

    export interface IntrinsicAttributes extends JsxRuntime.JsxIntrinsicAttributes {}

    export interface IntrinsicElements extends IntrinsicAttributesMap {}

    export interface IntrinsicClassAttributes extends JsxRuntime.JsxIntrinsicClassAttributes {}

    export interface LibraryManagedAttributes<C, P> {

    }
  }
}
