/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/no-namespace,@typescript-eslint/no-empty-object-type */
import {createElementMulti, createElementSingle} from '#src/disreact/model/create-element.ts';
import type {ActionRowAttributes, ButtonAttributes, DialogAttributes, EmbedAttributes, MessageAttributes, SelectMenuAttributes, TextInputAttributes} from '#src/disreact/model/types.ts';
import type {Message} from 'dfx/types';

type Value = {value?: string} | {children: string};

export declare namespace JSX {
  export type Element = Message;
  export type ElementType = any;

  export interface IntrinsicAttributes {
    _tag? : string;
    _rest?: string;
  }

  export interface IntrinsicElements {
    actionrow  : ActionRowAttributes;
    actions    : ActionRowAttributes;
    components : ActionRowAttributes;
    buttons    : ActionRowAttributes;
    button     : ButtonAttributes;
    success    : ButtonAttributes;
    danger     : ButtonAttributes;
    primary    : ButtonAttributes;
    secondary  : ButtonAttributes;
    link       : ButtonAttributes;
    modal      : DialogAttributes;
    dialog     : DialogAttributes;
    embeds     : {};
    embed      : EmbedAttributes;
    title      : Value;
    description: Value;
    message    : MessageAttributes;
    content    : Value;
    select     : SelectMenuAttributes;
    selectmenu : SelectMenuAttributes;
    option     : {};
    textinput  : TextInputAttributes;
    text       : TextInputAttributes;
  }
}

export const Fragment = undefined;
export const jsx      = createElementSingle;
export const jsxs     = createElementMulti;
export const jsxDEV   = createElementSingle;
