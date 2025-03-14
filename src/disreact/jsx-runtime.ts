import type {IntrinsicMap} from '#src/disreact/codec/element/intrinsic/index.ts';
import {fragment, createMultiple, createSingle} from '#src/disreact/model/lifecycle/create.ts';
import type {Elem} from '#src/disreact/model/element/element.ts';



export const Fragment = fragment;
export const jsx      = createSingle;
export const jsxs     = createMultiple;
export const jsxDEV   = createSingle;

export declare namespace JSX {
  type ElementType =
    | any
    | keyof IntrinsicElements
    | string
    | boolean
    | null
    | undefined;

  type Element = Elem;

  interface ElementAttributesProperty {
    props: any;
  }

  interface ElementChildrenAttribute {
    children: any;
  }

  interface IntrinsicAttributes {
    children?: any | any[];
  }

  interface IntrinsicClassAttributes {
    children: any[];
  }

  interface IntrinsicElements extends IntrinsicMap {}
}
