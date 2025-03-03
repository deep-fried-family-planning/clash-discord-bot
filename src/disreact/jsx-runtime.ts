/* eslint-disable @typescript-eslint/no-namespace,@typescript-eslint/no-redundant-type-constituents */
import type * as Component from '#src/disreact/codec/component/function.ts';
import * as Element from '#src/disreact/codec/dsx/index.ts';
import type {IntrinsicMap} from '#src/disreact/codec/dsx/intrinsic/index.ts';
import {dsx, dsxs, fragment} from '#src/disreact/model/dsx/dsx.ts';



export const Fragment = fragment;
export const jsx      = dsx;
export const jsxs     = dsxs;
export const jsxDEV   = dsx;



export declare namespace JSX {
  type ElementType =
    | Component.T<any, Element>
    | keyof IntrinsicElements
    | string
    | boolean
    | null
    | undefined;

  type Element = Element.T;

  interface LibraryManagedAttributes {
    displayName?: string;
    ref?        : any;
    key?        : string | number;
    children?   : any;
    isSync?     : boolean | undefined;
    isAsync?    : boolean | undefined;
    isEffect?   : boolean | undefined;
    isMemo?     : boolean | undefined;
  }

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
