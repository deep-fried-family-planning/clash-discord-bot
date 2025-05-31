import {declareElem, declareProps} from '#src/disreact/codec/intrinsic/util.ts';

import * as S from 'effect/Schema';

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

export const encode = (self: any, acc: any) => {
  throw new Error('Not implemented');
};
