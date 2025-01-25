/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument,@typescript-eslint/no-namespace */
import type {ActionRowAttributes, ButtonAttributes, DialogAttributes, EmbedAttributes, MessageAttributes, SelectMenuAttributes, TextInputAttributes} from '#disreact/dsx/intrinsic.ts';
import {createElementMulti, createElementSingle} from '#src/disreact/dsx/create-element.ts';
import type {Message} from 'dfx/types';

export declare namespace JSX {
  export type Element = Message;
  export type ElementType = any;

  export interface IntrinsicAttributes {
    _tag? : string;
    _rest?: string;
  }

  export interface IntrinsicElements {
    actionrow : ActionRowAttributes;
    components: ActionRowAttributes;
    dialog    : DialogAttributes;
    text      : TextInputAttributes;
    embed     : EmbedAttributes;
    message   : MessageAttributes;
    select    : SelectMenuAttributes;
    button    : ButtonAttributes;
  }
}


export const Fragment = undefined;
export const jsx      = createElementSingle;
export const jsxs     = createElementMulti;
export const jsxDEV   = (type: any, props: any) => {
  console.log('jsxDEV');
  if ('children' in props) {
    if (Array.isArray(props.children)) {
      return jsxs(type, props);
    }
  }
  return jsx(type, props);
};
