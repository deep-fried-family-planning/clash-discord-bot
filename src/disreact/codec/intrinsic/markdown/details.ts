import {declareElem, declareProps} from '#src/disreact/codec/intrinsic/util.ts';

import * as S from 'effect/Schema';

export * as Details from '#src/disreact/codec/intrinsic/markdown/details.ts';
export type Details = never;

export const TAG  = 'details',
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
  return '';
};
