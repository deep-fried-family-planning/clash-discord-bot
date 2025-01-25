/* eslint-disable @typescript-eslint/no-namespace,@typescript-eslint/no-empty-object-type,@typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-argument */

import type {DisReactComponent} from '#disreact/danger/model/DisReactComponent.ts';
import type {FC} from '#disreact/dsx/intrinsic-elements/index.ts';
import {Button, Buttons, Dialog, Dsx, type Embed, Message, Select, Text} from '#disreact/dsx/intrinsic-elements/index.ts';
import type {Rf} from '#disreact/virtual/entities/index.ts';
import type {Auth} from '#disreact/virtual/kinds/index.ts';
import {D} from '#pure/effect';
import type {ne, num, rec, str} from '#src/internal/pure/types-pure.ts';



export declare namespace DisReact {
  export type MetaAttribute = {
    name  : str;
    type  : str;
    id    : str;
    rc    : num;
    key   : str;
    params: rec<str>;
  };
  export type Intrinsic = {
    _tag : str;
    key  : str;
    ref  : Rf.T;
    refs : Rf.T[];
    _meta: MetaAttribute;
  };
}


export declare namespace JSX {
  export type Element = ne;

  export type ElementType =
    | keyof IntrinsicElements
    | undefined
    | null
    | FC.Type
    | DisReactComponent
    | (keyof IntrinsicElements | undefined | FC.Type | DisReactComponent)[];

  export interface IntrinsicAttributes {
    displayName?: str;
    id?         : str;
    ref?        : Rf.T;
    refs?       : Rf.T[];
    key?        : str;
    auths?      : Auth.T[];
    _meta?      : DisReact.MetaAttribute;
  }

  export type IntrinsicElements = {
    button : IntrinsicAttributes & Button.Attributes;
    buttons: IntrinsicAttributes & Buttons.Attributes;
    dialog : IntrinsicAttributes & Dialog.Attributes;
    dsx    : IntrinsicAttributes & Dsx.Attributes;
    embed  : IntrinsicAttributes & Embed.Attributes;
    message: IntrinsicAttributes & Message.Attributes;
    select : IntrinsicAttributes & Select.Attributes;
    text   : IntrinsicAttributes & Text.Attributes;
  };

  export interface ElementChildrenAttribute {
    children: {};
  }

  export interface ElementAttributesProperty {
    props: {};
  }

}



const modelIntrinsic = (tag, props) => {
  switch (tag) {
    case Button.dsx:
      return Button.modelJsx(tag, props);
    case Buttons.dsx:
      return Buttons.modelJsx(tag, props);
    case Select.dsx:
      return Select.modelJsx(tag, props);
    case Text.dsx:
      return Text.jsxText(tag, props);
    case Message.dsx:
      return Message.modelJsx(tag, props);
    case Dialog.dsx:
      return Dialog.createDialogElement(tag, props);
    case Dsx.DSXTag:
      return Dsx.createRootElement(tag, props);
    default:
      console.log('unknown tag', tag);
      return tag;
  }
};


const unwrapChildren = (children: ne) => {
  const childs = [];
  if (children === null || children === undefined || children === false) {
    return [];
  }
  if (Array.isArray(children)) {
    for (const child of children) {
      if (Array.isArray(child)) {
        childs.push(...child);
      }
      else {
        childs.push(child);
      }
    }
  }
  else {
    childs.push(children);
  }

  return childs;
};


const unwrap = (props: ne) => {
  if (props === undefined) {
    return {};
  }
  return props;
};


type Element = D.TaggedEnum<{
  intrinsic: {attributes: str};
  func     : {attributes: str};
  frag     : {attributes: str};

}>;

const element   = D.taggedEnum<Element>();
const intrinsic = element.intrinsic;
const func      = element.func;
const frag      = element.frag;


export const jsx = (
  tag: ne,
  input: ne,
) => {
  const {children: _, ...props} = unwrap(input);
  const children                = unwrapChildren(_);
  console.log();

  if (typeof tag === 'function' && tag.name === Fragment.name) {
    return children;
  }

  if (typeof tag === 'function') {
    const returned = {
      props,
      render: (next) => tag(next),
    };
    if (children.length) {
      returned.children = children;
    }
    return {

      children,
    };
  }

  if (typeof tag === 'string') {
    return {
      type: 'intrinsic',
      name: tag,
      props,
      children,
    };
  }
};

export const jsxs = jsx;

export const jsxDEV = jsx;

export const Fragment = (props: ne) => props.children;
