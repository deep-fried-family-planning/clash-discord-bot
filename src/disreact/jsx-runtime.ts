/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/no-namespace */
import {createElementMulti, createElementSingle} from '#src/disreact/model/dsx/create-element.ts';
import type {ActionRowAttributes, ButtonAttributes, DialogAttributes, EmbedAttributes, MessageAttributes, SelectMenuAttributes, TextInputAttributes} from '#src/disreact/model/dsx/intrinsic.ts';
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
    button    : ButtonAttributes;
    components: ActionRowAttributes;
    dialog    : DialogAttributes;
    embed     : EmbedAttributes;
    message   : MessageAttributes;
    select    : SelectMenuAttributes;
    text      : TextInputAttributes;
  }
}

export const Fragment = undefined;
export const jsx      = createElementSingle;
export const jsxs     = createElementMulti;
export const jsxDEV   = createElementSingle;
