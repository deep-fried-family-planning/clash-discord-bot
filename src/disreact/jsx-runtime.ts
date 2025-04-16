import type {IntrinsicTuplesMapped} from '#src/disreact/codec/rest-elem/index.ts';
import type {Elem} from '#src/disreact/model/elem/elem.ts';
import {Lifecycle} from '#src/disreact/model/lifecycle.ts';

export const Fragment = Lifecycle.Fragment;
export const jsx = Lifecycle.jsx;
export const jsxs = Lifecycle.jsxs;
export const jsxDEV = Lifecycle.jsxDEV;

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
    | ((props?: any) => ElementType | Element);

  type Element = Elem;

  interface ElementAttributesProperty {
    props?: {};
  }

  interface ElementChildrenAttribute {
    children?: {};
  }

  interface IntrinsicAttributes {

  }

  interface IntrinsicClassAttributes {
  }

  interface IntrinsicElements extends IntrinsicTuplesMapped {}
}
