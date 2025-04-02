import type {IntrinsicTuplesMapped} from '#src/disreact/codec/rest-elem/index.ts'
import {Elem} from '#src/disreact/model/entity/elem.ts'


export const Fragment = Elem.Frag.Type
export const jsx = Elem.jsx
export const jsxs = Elem.jsxs
export const jsxDEV = Elem.jsxDEV

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
    | ((props?: any) => ElementType | Element)

  type Element = {type: any, props: any, nodes: any[], id: string, ids: string, idx: string}

  interface ElementAttributesProperty {
    props?: {}
  }

  interface ElementChildrenAttribute {
    children?: {}
  }

  interface IntrinsicAttributes {

  }

  interface IntrinsicClassAttributes {
  }

  interface IntrinsicElements extends IntrinsicTuplesMapped {}
}
