import {Keys} from '#src/disreact/codec/intrinsic/keys.ts';
import {declareElem, declareProps} from '#src/disreact/codec/intrinsic/util.ts';

import * as S from 'effect/Schema';

export * as Code from '#src/disreact/codec/intrinsic/markdown/code.ts';
export type Code = never;

export const TAG  = 'code',
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
  return `\`${acc[Keys.primitive][0]}\``;
};
