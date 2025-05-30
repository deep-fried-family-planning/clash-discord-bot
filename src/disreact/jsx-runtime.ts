import type {IntrinsicTuplesMapped} from '#src/disreact/codec/intrinsic/index.ts';
import type {Elem} from '#src/disreact/model/elem/elem.ts';
import * as Pragma from '#src/disreact/mode/pragma.ts';
import type * as FC from '#src/disreact/mode/entity/fc.ts';
import type * as El from '#src/disreact/mode/entity/el.ts';

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
    | FC.Any;

  type Element = El.El;

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
