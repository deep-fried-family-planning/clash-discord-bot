import {declareElem, declareProps} from '#src/disreact/codec/intrinsic/util.ts';
import type {Elem} from '#src/disreact/model/elem/elem.ts';
import * as S from 'effect/Schema';
import {Keys} from '../keys';

export * as Italic from '#src/disreact/codec/intrinsic/markdown/i.ts';
export type Italic = never;

export const TAG  = 'i',
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
  return `*${acc[Keys.primitive][0]}*`;
};
