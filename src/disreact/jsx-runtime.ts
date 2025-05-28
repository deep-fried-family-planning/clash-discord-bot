import type {IntrinsicTuplesMapped} from '#src/disreact/codec/intrinsic/index.ts';
import type {Elem} from '#src/disreact/model/elem/elem.ts';
import type {FC} from './model/elem/fc';
import * as Jsx from 'src/disreact/mode/schema/jsx.ts';

export const Fragment = Jsx.Fragment;
export const jsx = Jsx.jsx;
export const jsxs = Jsx.jsxs;
export const jsxDEV = Jsx.jsxDEV;

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
