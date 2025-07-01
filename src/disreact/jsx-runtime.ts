import type {Core} from '#disreact/core/types';
import type {IntrinsicAttributesMap} from '#src/disreact/adaptor/codec/intrinsic/types.ts';
import type * as Element from '#src/disreact/adaptor/adaptor/element.ts';
import type * as FC from '#disreact/core/internal/fc.ts';
import * as Jsx from '#src/disreact/adaptor/adaptor/jsx.ts';
import * as E from 'effect/Effect';

export const Fragment = Jsx.Fragment,
             jsx      = Jsx.jsx,
             jsxs     = Jsx.jsxs,
             jsxDEV   = Jsx.jsxDEV;

export type JsxElementType = | keyof IntrinsicAttributesMap
                             | Element.Primitive
                             | FC.FC;

export type JsxElement = Element.Element;

export type JsxElementAttributesProperty = {
  props?: any;
};

export type JsxElementChildrenAttribute = {
    children?: any;
  };

export type JsxIntrinsicAttributes = {
  children?: any;
};

export type JsxIntrinsicClassAttributes = {};

export interface JsxIntrinsicElements extends IntrinsicAttributesMap {}

export declare namespace JSX {
    export type ElementType<E, R> = | keyof IntrinsicElements
                                    | Core.FC<any, E, R>;

    export type Element = | string
                          | Core.Element;

  export interface ElementAttributesProperty extends JsxElementAttributesProperty {}
  export interface ElementChildrenAttribute extends JsxElementChildrenAttribute {}
  export interface IntrinsicAttributes extends JsxIntrinsicAttributes {}
  export interface IntrinsicClassAttributes extends JsxIntrinsicClassAttributes {}
  export interface IntrinsicElements extends JsxIntrinsicElements {}
}
