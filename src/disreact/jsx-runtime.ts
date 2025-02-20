/* eslint-disable @typescript-eslint/no-namespace,@typescript-eslint/no-redundant-type-constituents */
import type {IntrinsicMap} from '#src/disreact/codec/schema/intrinsic/index.ts';
import {dsxRuntime, dsxs, fragment} from '#src/disreact/dsx/dsx-runtime.ts';



export const Fragment = fragment;
export const jsx = dsxRuntime;
export const jsxs = dsxs;
export const jsxDEV = dsxRuntime;



declare global {
  export namespace DSX {
    type ElementType =
      | keyof JSX.IntrinsicElements
      | FunctionComponent
      | Fragment
      | Node;

    type Fragment = {} | Node[];

    type Node =
      | Fragment
      | Element
      | string
      | number
      | bigint
      | boolean
      | null
      | undefined;

    type FunctionComponent<P = unknown> = (props: P) => Node | null;
    type FC<P = unknown> = FunctionComponent<P>;

    type Element<
      P = any,
      T extends string | FunctionComponent<any> = string | FunctionComponent<any>,
    > =
      | {
      type : T;
      props: P;
    };
  }
}



declare global {
  export namespace JSX {
    type ElementType =
      | ((props: any) => Element)
      | keyof IntrinsicElements
      | string
      | number
      | bigint
      | boolean
      | null
      | undefined;

    type Element = any;
    interface ElementAttributesProperty {
      props: any;
    }
    interface ElementChildrenAttribute {
      children: any;
    }
    interface IntrinsicAttributes {
      children?: any |  any[];
    }
    interface IntrinsicClassAttributes {
      children: any[];
    }
    interface IntrinsicElements extends IntrinsicMap {}
  }
}
