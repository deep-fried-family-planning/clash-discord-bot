import type * as Element from '#disreact/core/Element.ts';
import type * as FC from '#disreact/core/FC.ts';
import type {IntrinsicAttributesMap} from '#src/disreact/adaptor/codec/intrinsic/types.ts';
import * as Jsx from '#disreact/model/runtime/Jsx.tsx';

export const Fragment = Jsx.Fragment,
             jsx      = Jsx.make,
             jsxs     = Jsx.makeMulti;

export type JsxElementType =
  | keyof IntrinsicAttributesMap
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
