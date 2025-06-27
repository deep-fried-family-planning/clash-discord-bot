import type {IntrinsicAttributesMap} from '#src/disreact/adaptor/codec/intrinsic/types.ts';
import type * as Element from '#src/disreact/adaptor/codec/adaptor/exp/domain/old/element.ts';
import type * as FC from '#src/disreact/model/runtime/fc.ts';
import * as Jsx from '#src/disreact/adaptor/codec/adaptor/jsx.ts';

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
  export type ElementType = JsxElementType;
  export type Element = JsxElement;
  export interface ElementAttributesProperty extends JsxElementAttributesProperty {}
  export interface ElementChildrenAttribute extends JsxElementChildrenAttribute {}
  export interface IntrinsicAttributes extends JsxIntrinsicAttributes {}
  export interface IntrinsicClassAttributes extends JsxIntrinsicClassAttributes {}
  export interface IntrinsicElements extends JsxIntrinsicElements {}
}
