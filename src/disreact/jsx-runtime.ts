/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/no-namespace,@typescript-eslint/no-empty-object-type,@typescript-eslint/no-redundant-type-constituents */
import {__Fragment, _jsx, _jsxs} from '#src/disreact/model/dsx/pragma.tsx';
import type {DFMDAnchorElement, DFMDElement, DFMDMentionElement, DTMLButtonElement, DTMLChoiceElement, DTMLCommandElement, DTMLComponentRowElement, DTMLEmbedDescriptionElement, DTMLEmbedElement, DTMLEmbedFieldElement, DTMLEmbedFooterElement, DTMLEmbedTitleElement, DTMLEmojiElement, DTMLMenuElement, DTMLMessageContentElement, DTMLMessageElement, DTMLModalElement, DTMLOptionElement, DTMLParameterElement, DTMLTextElement, DTMLValueElement} from '#src/disreact/model/dsx/types.ts';



export const Fragment = __Fragment;
export const jsx      = _jsx;
export const jsxs     = _jsxs;
export const jsxDEV   = _jsx;



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


  export namespace JSX {
    type ElementType = DSX.ElementType;

    type Element = any;

    interface ElementClass {
      render(): DSX.Node;
    }

    interface ElementAttributesProperty {
      props: any;
    }

    interface ElementChildrenAttribute {
      children: any;
    }

    interface IntrinsicAttributes {

    }

    interface IntrinsicClassAttributes {

    }

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

      dfmd      : DFMDElement;
      span      : DFMDElement;
      at        : DFMDMentionElement;
      a         : DFMDAnchorElement;
      mask      : DFMDElement;
      p         : DFMDElement;
      br        : DFMDElement;
      b         : DFMDElement;
      i         : DFMDElement;
      u         : DFMDElement;
      s         : DFMDElement;
      details   : DFMDElement;
      code      : DFMDElement;
      pre       : DFMDElement;
      blockquote: DFMDElement;
      h1        : DFMDElement;
      h2        : DFMDElement;
      h3        : DFMDElement;
      small     : DFMDElement;
      ol        : DFMDElement;
      ul        : DFMDElement;
      li        : DFMDElement;
    }
  }
}
