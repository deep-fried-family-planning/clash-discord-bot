/* eslint-disable @typescript-eslint/no-namespace,@typescript-eslint/no-redundant-type-constituents */
import type {Component, FEC} from '#src/disreact/codec/dsx/element/function-element.ts';
import type {IntrinsicMap} from '#src/disreact/codec/dsx/element/intrinsics/index.ts';
import {dsx, dsxs, fragment} from '#src/disreact/model/dsx/dsx.ts';
import type * as DSX from './codec/dsx/index.ts';



export const Fragment = fragment;
export const jsx      = dsx;
export const jsxs     = dsxs;
export const jsxDEV   = dsx;

export type {
  FEC as FC,
};

declare global {
  export namespace DisReact {
    type FC<P = any> = FEC<P>;
  }
}



export declare namespace JSX {
  type ElementType =
    | Component<any, Element>
    | keyof IntrinsicElements
    | string
    | boolean
    | null
    | undefined;

  type Element = DSX.Element.T;

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
