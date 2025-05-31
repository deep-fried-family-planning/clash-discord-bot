import {declareElem, declareProps} from '#src/disreact/codec/intrinsic/util.ts';

import * as S from 'effect/Schema';
import {Keys} from '../keys';

export * as H1 from '#src/disreact/codec/intrinsic/markdown/h1.ts';
export type H1 = never;

export const TAG  = 'h1',
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
  return `# ${acc[Keys.primitive][0]}`;
};
