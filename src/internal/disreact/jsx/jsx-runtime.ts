/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/no-unused-vars,@typescript-eslint/no-empty-object-type,@typescript-eslint/no-namespace */


import type {ne, num, str} from '#src/internal/pure/types-pure';
import type {JSXIntrinsic} from '@disreact-jsx/elements/index.ts';
import {renderJSX} from '@disreact-jsx/rendering.ts';
import type {Rf} from '../virtual/entities';


export const jsx    = renderJSX;
export const jsxs   = renderJSX;
export const jsxDEV = renderJSX;


export namespace JSX {
  export type Element = any;

  export type ElementType =
    | keyof IntrinsicElements
    | ((props: any) => Element)
    | (new (props: any) => ElementClass);


  export interface ElementClass {
    render: () => {};
  }

  export interface ElementChildrenAttribute {
    children?: IntrinsicElements | IntrinsicElements[] | null | undefined;
  }

  interface ElementAttributesProperty {
    props: ne;
  }

  export interface IntrinsicAttributes {
    root_id?  : num;
    root_name?: str;
    node_id?  : num;
    node_name?: str;
    ref?      : Rf.T;
    refs?     : Rf.T[];
  }

  export interface IntrinsicElements extends JSXIntrinsic {}
}
