import {declareElem, declareProps} from '#src/disreact/codec/intrinsic/util.ts';
import type {Elem} from '#src/disreact/model/elem/elem.ts';
import {S} from '#src/disreact/utils/re-exports.ts';
import {Keys} from '../keys';

export * as Small from '#src/disreact/codec/intrinsic/markdown/small.ts';
export type Small = typeof Small;

export const TAG  = 'small',
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
  return `-# ${acc[Keys.primitive]?.[0]}`;
};
