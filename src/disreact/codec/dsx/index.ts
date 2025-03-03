import * as Function from '#src/disreact/codec/dsx/function.ts';
import * as Intrinsic from '#src/disreact/codec/dsx/intrinsic.ts';
import * as Text from '#src/disreact/codec/dsx/text.ts';
import {S} from '#src/internal/pure/effect.ts';

export * as Function from '#src/disreact/codec/dsx/function.ts';
export * as Intrinsic from '#src/disreact/codec/dsx/intrinsic.ts';
export * as Text from '#src/disreact/codec/dsx/text.ts';
export * as Props from '#src/disreact/codec/component/props.ts';
export * as Children from '#src/disreact/codec/component/children.ts';
export * as Component from '#src/disreact/codec/component/function.ts';
export * as Fragment from './fragment.ts';


export const T                = S.Union(Function.T, Intrinsic.T, Text.T);
export const FunctionElement  = Function.T;
export const IntrinsicElement = Intrinsic.T;
export const TextElement      = Text.T;

export type T =
  | Function.T
  | Intrinsic.T
  | Text.T;
export type FunctionElement = Function.T;
export type IntrinsicElement = Intrinsic.T;
export type TextElement = Text.T;

export const isFunctionElement  = Function.is;
export const isIntrinsicElement = Intrinsic.is;
export const isTextElement      = Text.is;

export const isFunction  = Function.is;
export const isIntrinsic = Intrinsic.is;
export const isText      = Text.is;
