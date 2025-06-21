import type {IntrinsicAttributesMap} from '#src/disreact/codec/intrinsic/types.ts';
import * as Pragma from '#src/disreact/model/internal/core/pragma.ts';

export const Fragment = Pragma.Fragment;

export const jsx = Pragma.jsx;

export const jsxs = Pragma.jsxs;

export const jsxDEV = Pragma.jsxDEV;

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
