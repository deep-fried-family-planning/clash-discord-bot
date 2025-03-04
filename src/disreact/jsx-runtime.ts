/* eslint-disable @typescript-eslint/no-namespace,@typescript-eslint/no-redundant-type-constituents */
import {dsx, dsxs, fragment} from '#src/disreact/codec/dsx/dsx.ts';
import type * as Element from '#src/disreact/codec/element/index.ts';
import type {IntrinsicMap} from '#src/disreact/codec/element/intrinsic/index.ts';
import type * as FC from './codec/element/function-component.ts';


export const Fragment = fragment;
export const jsx      = dsx;
export const jsxs     = dsxs;
export const jsxDEV   = dsx;

export declare namespace JSX {
  type ElementType =
    | FC.FC
    | keyof IntrinsicElements
    | string
    | boolean
    | null
    | undefined;

  type Element = Element.T;

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
