import {declareElem, declareProps} from '#src/disreact/codec/intrinsic/util.ts';

import * as S from 'effect/Schema';

export * as ListItem from '#src/disreact/codec/intrinsic/markdown/li.ts';
export type ListItem = never;

export const TAG  = 'li',
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
