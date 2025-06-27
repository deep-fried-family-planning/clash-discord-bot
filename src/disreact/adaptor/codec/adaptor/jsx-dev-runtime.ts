import type * as JsxRuntime from '#src/disreact/adaptor/codec/adaptor/jsx-runtime.ts';
import * as Pragma from '#src/disreact/adaptor/codec/adaptor/domain/pragma.ts';

export const Fragment = JsxRuntime.Fragment;

export const jsx = JsxRuntime.jsx;

export const jsxs = JsxRuntime.jsxs;

export const jsxDEV = JsxRuntime.jsxDEV;

export declare namespace JSX {
  export type ElementType = JsxRuntime.JsxElementType;
  export type Element = JsxRuntime.JsxElement;
  export interface ElementAttributesProperty extends JsxRuntime.JsxElementAttributesProperty {}
  export interface ElementChildrenAttribute extends JsxRuntime.JsxElementChildrenAttribute {}
  export interface IntrinsicAttributes extends JsxRuntime.JsxIntrinsicAttributes {}
  export interface IntrinsicClassAttributes extends JsxRuntime.JsxIntrinsicClassAttributes {}
  export interface IntrinsicElements extends JsxRuntime.JsxIntrinsicElements {}
}
