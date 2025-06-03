import type {IntrinsicAttributesMap} from '#src/disreact/codec/intrinsic/types.ts';
import * as Dsx from '#src/disreact/model/dsx.ts';
import type * as FC from '#src/disreact/model/entity/fc.ts';
import type * as El from '#src/disreact/model/entity/el.ts';

export const Fragment = Dsx.Fragment;
export const jsx = Dsx.jsx;
export const jsxs = Dsx.jsxs;
export const jsxDEV = Dsx.jsxDEV;

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

  type Element = El.El;

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
