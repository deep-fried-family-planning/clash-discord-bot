/* eslint-disable @typescript-eslint/no-namespace,@typescript-eslint/no-redundant-type-constituents */
import {dsx, dsxs, fragment} from '#src/disreact/internal/dsx/dsx.ts';
import type {DFMDAnchorElement, DFMDElement, DFMDMentionElement, DTMLButtonElement, DTMLChoiceElement, DTMLCommandElement, DTMLComponentRowElement, DTMLEmbedDescriptionElement, DTMLEmbedElement, DTMLEmbedFieldElement, DTMLEmbedFooterElement, DTMLEmbedTitleElement, DTMLEmojiElement, DTMLMenuElement, DTMLMessageContentElement, DTMLMessageElement, DTMLModalElement, DTMLOptionElement, DTMLParameterElement, DTMLTextElement, DTMLValueElement} from '#src/disreact/internal/dsx/types.ts';



export const Fragment = fragment;
export const jsx      = dsx;
export const jsxs     = dsxs;
export const jsxDEV   = dsx;



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
      | undefined
      | symbol;

    type Element = any;
    interface ElementAttributesProperty {props: any}
    interface ElementChildrenAttribute {children?: any}
    interface IntrinsicAttributes {}
    interface IntrinsicClassAttributes {}
    interface IntrinsicElements {
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
}
