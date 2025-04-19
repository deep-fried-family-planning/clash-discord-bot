import {declareElem, declareProps} from '#src/disreact/codec/intrinsic/util.ts';
import {S} from '#src/disreact/utils/re-exports.ts';
import type {Elem} from '#src/disreact/model/elem/elem.ts';
import { Keys } from '../keys';

export * as Strikethrough from '#src/disreact/codec/intrinsic/markdown/s.ts';
export type Strikethrough = typeof Strikethrough;

export const TAG  = 's',
             NORM = TAG;

export const Children = S.Union(
  S.String,
);

export const Attributes = declareProps(
  S.Struct({}),
);

export const Element = declareElem(
  TAG,
  Attributes,
);

export const encode = (self: Elem.Rest, acc: any) => {
  return `~~${acc[Keys.primitive][0]}~~`;
};
