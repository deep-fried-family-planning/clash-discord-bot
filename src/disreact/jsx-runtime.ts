import type {IntrinsicMap} from '#src/disreact/codec/element/intrinsic/index.ts';
import type {FC} from '#src/disreact/model/entity/fc.ts';
import type {Elem} from '#src/disreact/model/entity/element.ts';
import {fragment, multi, single} from './model/dsx';



export const Fragment = fragment;
export const jsx      = single;
export const jsxs     = multi;
export const jsxDEV   = single;

export declare namespace JSX {
  type ElementType =
    | any
    | keyof IntrinsicElements
    | string
    | boolean
    | null
    | undefined;

  type Element = Elem.Element;

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
