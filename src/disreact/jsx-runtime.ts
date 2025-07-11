import type * as Element from '#disreact/core/Element.ts';
import type * as FC from '#disreact/core/FC.ts';
import type {IntrinsicAttributesMap} from '#src/disreact/adaptor/codec/intrinsic/types.ts';
import * as Markup from '#disreact/core/Jsx.ts';

export const Fragment = Markup.Fragment,
             jsx      = Markup.make,
             jsxs     = Markup.makeMulti;

export type JsxElementType =
  | keyof IntrinsicAttributesMap
  | Markup.Primitive
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

// export declare namespace JSX {
//   export type ElementType<E, R> = | keyof IntrinsicElements
//                                   | FC.FC<any, E, R>;
//
//   export type Element = | string
//                         | Element.Element;
//
//   export interface ElementAttributesProperty extends JsxElementAttributesProperty {}
//   export interface ElementChildrenAttribute extends JsxElementChildrenAttribute {}
//   export interface IntrinsicAttributes extends JsxIntrinsicAttributes {}
//   export interface IntrinsicClassAttributes extends JsxIntrinsicClassAttributes {}
//   export interface IntrinsicElements extends JsxIntrinsicElements {}
// }
