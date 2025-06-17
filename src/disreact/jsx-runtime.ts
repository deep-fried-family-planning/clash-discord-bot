import type {IntrinsicAttributesMap} from '#src/disreact/codec/intrinsic/types.ts';
import * as Element from '#src/disreact/model/internal/core/element.ts';
import type * as FC from '#src/disreact/model/internal/infrastructure/fc.ts';
import * as Jsx from '#src/disreact/model/internal/infrastructure/jsx.ts';

export const Fragment = Jsx.Fragment,
             jsx      = Jsx.jsx,
             jsxs     = Jsx.jsxs,
             jsxDEV   = Jsx.jsxDEV;

export declare namespace JSX {
  export type ElementType =
    | keyof IntrinsicElements
    | Element.Primitive
    | FC.FC;

  export type Element = Element.Element;

  export interface ElementAttributesProperty {
    props?: any;
  }

  export interface ElementChildrenAttribute {
    children?: any;
  }

  export interface IntrinsicAttributes {
    children?: any;
  }

  export interface IntrinsicClassAttributes {}

  export interface IntrinsicElements extends IntrinsicAttributesMap {}
}
