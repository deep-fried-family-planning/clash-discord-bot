/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/no-namespace,@typescript-eslint/no-empty-object-type,@typescript-eslint/no-redundant-type-constituents */
import {createElementMulti, createElementSingle} from '#src/disreact/model/dsx/create-element.ts';
import type {DFMDAnchorElement, DFMDElement, DFMDMentionElement, DTMLButtonElement, DTMLChoiceElement, DTMLCommandElement, DTMLComponentRowElement, DTMLEmbedDescriptionElement, DTMLEmbedElement, DTMLEmbedFieldElement, DTMLEmbedFooterElement, DTMLEmbedTitleElement, DTMLEmojiElement, DTMLMenuElement, DTMLMessageContentElement, DTMLMessageElement, DTMLModalElement, DTMLOptionElement, DTMLParameterElement, DTMLTextElement, DTMLValueElement, Intrinsic} from '#src/disreact/model/dsx/types.ts';
import type {E} from '#src/internal/pure/effect.ts';
import type {str} from '#src/internal/pure/types-pure.ts';


export declare namespace DSX {
  export type ElementType =
    | keyof Intrinsic;

  export type Element<
    P = unknown,
    T extends string | FC<any> = string,
  > = {
    type : T;
    props: P;
    key  : string | null;
  };

  export type FC<P = {}> = {
    (props: P): Node;
    displayName?: str;
  };

  export interface Portal extends Element {
    children: Node;
  }

  export type Node =
    | Portal
    | string
    | number
    | bigint
    | Node[]
    | boolean
    | null
    | undefined;

  export interface IntrinsicElements {
    command    : DTMLCommandElement;
    param      : DTMLParameterElement;
    choice     : DTMLChoiceElement;
    buttons    : DTMLComponentRowElement;
    button     : DTMLButtonElement;
    menu       : DTMLMenuElement;
    option     : DTMLOptionElement;
    value      : DTMLValueElement;
    emoji      : DTMLEmojiElement;
    text       : DTMLTextElement;
    message    : DTMLMessageElement;
    content    : DTMLMessageContentElement;
    modal      : DTMLModalElement;
    embed      : DTMLEmbedElement;
    title      : DTMLEmbedTitleElement;
    description: DTMLEmbedDescriptionElement;
    field      : DTMLEmbedFieldElement;
    footer     : DTMLEmbedFooterElement;
    dfmd       : DFMDElement;
    at         : DFMDMentionElement;
    a          : DFMDAnchorElement;
    mask       : DFMDElement;
    p          : DFMDElement;
    br         : DFMDElement;
    b          : DFMDElement;
    i          : DFMDElement;
    u          : DFMDElement;
    s          : DFMDElement;
    details    : DFMDElement;
    code       : DFMDElement;
    pre        : DFMDElement;
    blockquote : DFMDElement;
    h1         : DFMDElement;
    h2         : DFMDElement;
    h3         : DFMDElement;
    small      : DFMDElement;
    ol         : DFMDElement;
    ul         : DFMDElement;
    li         : DFMDElement;
  }
}


export declare namespace JSX {
  export type OmniFn = (props: any) => any;
  export type Func = (props: any) => any | E.Effect<any, any, any>;
  // export type EFunc<E = any, R = any> = (props: any) => E.Effect<ElementType, E, R>;
  // export type Basic =
  //   | string
  //   | null
  //   | boolean
  //   | number
  //   | undefined;

  export type Element = DSX.Element;

  export type ElementType = DSX.Node;

  // export interface ElementChildrenAttribute {
  //   children?: {};
  // }
  //
  // export interface ElementAttributesProperty {
  //   props?: {};
  // }

  export interface IntrinsicElements extends DSX.IntrinsicElements {}
}

export const Fragment = undefined;
export const jsx      = createElementSingle;
export const jsxs     = createElementMulti;
export const jsxDEV   = createElementSingle;
