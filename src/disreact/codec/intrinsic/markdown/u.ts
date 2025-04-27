import {declareElem, declareProps} from '#src/disreact/codec/intrinsic/util.ts';
import type {Elem} from '#src/disreact/model/elem/elem.ts';
import {S} from '#src/disreact/utils/re-exports.ts';
import {Keys} from '../keys';

export * as Underline from '#src/disreact/codec/intrinsic/markdown/u.ts';
export type Underline = typeof Underline;

export const TAG  = 'u',
             NORM = Keys.primitive;

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
  return `__${acc[Keys.primitive]?.[0]}__`;
};
