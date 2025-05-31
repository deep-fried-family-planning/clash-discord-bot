import {declareElem, declareProps} from '#src/disreact/codec/intrinsic/util.ts';

import * as S from 'effect/Schema';
import {Keys} from '../keys';

export * as Paragraph from '#src/disreact/codec/intrinsic/markdown/p.ts';
export type Paragraph = never;

export const TAG  = 'p',
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

export const encode = (self: any, acc: any) => {
  return `\n${acc[Keys.primitive]?.[0]}`;
};
