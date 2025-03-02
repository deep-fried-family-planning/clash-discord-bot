import {S} from '#src/internal/pure/effect.ts';
import * as Function from '#src/disreact/codec/dsx/element/function-element.ts';
import * as Intrinsic from '#src/disreact/codec/dsx/element/intrinsic-element.ts';
import * as Text from '#src/disreact/codec/dsx/element/text-element.ts';
export * as Function from '#src/disreact/codec/dsx/element/function-element.ts';
export * as Intrinsic from '#src/disreact/codec/dsx/element/intrinsic-element.ts';
export * as Text from '#src/disreact/codec/dsx/element/text-element.ts';
export * as Props from 'src/disreact/codec/dsx/common/props.ts';
export * as Children from '#src/disreact/codec/dsx/common/children.ts';
export * as Component from '#src/disreact/codec/dsx/common/component.ts';



export const T = S.Union(
  Function.T,
  Intrinsic.T,
  Text.T,
);

export type T =
  | Function.T
  | Intrinsic.T
  | Text.T;

export const isFunction = Function.is;
export const isIntrinsic = Intrinsic.is;
export const isText = Text.is;
