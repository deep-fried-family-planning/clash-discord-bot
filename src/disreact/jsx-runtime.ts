import type {IntrinsicTuplesMapped} from '#src/disreact/codec/intrinsic/index.ts';
import type {Elem} from '#src/disreact/model/elem/elem.ts';
import type {FC} from './model/elem/fc';
import {Pragma} from './model/pragma';

export const Fragment = Pragma.Fragment;
export const jsx = Pragma.jsx;
export const jsxs = Pragma.jsxs;
export const jsxDEV = Pragma.jsxDEV;

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
    | FC;

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
