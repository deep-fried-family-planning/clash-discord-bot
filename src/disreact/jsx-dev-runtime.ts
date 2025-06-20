import type * as JsxRuntime from '#src/disreact/jsx-runtime.ts';
import * as Jsx from '#src/disreact/model/internal/domain/jsx.ts';

export const Fragment = Jsx.Fragment,
             jsx      = Jsx.jsx,
             jsxs     = Jsx.jsxs,
             jsxDEV   = Jsx.jsxDEV;

export declare namespace JSX {
  export type ElementType = JsxRuntime.JsxElementType;
  export type Element = JsxRuntime.JsxElement;
  export interface ElementAttributesProperty extends JsxRuntime.JsxElementAttributesProperty {}
  export interface ElementChildrenAttribute extends JsxRuntime.JsxElementChildrenAttribute {}
  export interface IntrinsicAttributes extends JsxRuntime.JsxIntrinsicAttributes {}
  export interface IntrinsicClassAttributes extends JsxRuntime.JsxIntrinsicClassAttributes {}
  export interface IntrinsicElements extends JsxRuntime.JsxIntrinsicElements {}
}
