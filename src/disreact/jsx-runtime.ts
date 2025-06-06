import type {IntrinsicAttributesMap} from '#src/disreact/codec/intrinsic/types.ts';
import * as El from '#src/disreact/model/entity/element.ts';
import type * as FC from '#src/disreact/model/entity/fc.ts';

export const Fragment = El.Fragment,
             jsx      = El.jsx,
             jsxs     = El.jsxs,
             jsxDEV   = El.jsxDEV;

export declare namespace JSX {
  type ElementType =
    | keyof IntrinsicElements
    | null
    | undefined
    | string
    | number
    | boolean
    | symbol
    | bigint
    | FC.Any;

  type Element = El.Node;

  interface ElementAttributesProperty {
    props?: {};
  }

  interface ElementChildrenAttribute {
    children?: {};
  }

  interface IntrinsicAttributes {
    children?: any;
  }

  interface IntrinsicClassAttributes {
  }

  interface IntrinsicElements extends IntrinsicAttributesMap {}
}
