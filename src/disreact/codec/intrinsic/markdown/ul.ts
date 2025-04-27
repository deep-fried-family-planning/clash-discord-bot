import {declareElem, declareProps} from '#src/disreact/codec/intrinsic/util.ts';
import type {Elem} from '#src/disreact/model/elem/elem.ts';
import {S} from '#src/disreact/utils/re-exports.ts';

export * as UnorderedList from '#src/disreact/codec/intrinsic/markdown/ul.ts';
export type UnorderedList = typeof UnorderedList;

export const TAG  = 'ul',
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
  throw new Error('Not implemented');
};
