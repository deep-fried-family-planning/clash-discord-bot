import type {IntrinsicTuplesMapped} from '#src/disreact/codec/dapi-elem/index.ts';
import type {Elem} from '#src/disreact/model/elem/elem.ts';
import {Lifecycles} from '#src/disreact/model/lifecycles.ts';

export const Fragment = Lifecycles.Fragment;
export const jsx = Lifecycles.jsx;
export const jsxs = Lifecycles.jsxs;
export const jsxDEV = Lifecycles.jsxDEV;

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
