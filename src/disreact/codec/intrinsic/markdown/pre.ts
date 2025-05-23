import {declareElem, declareProps} from '#src/disreact/codec/intrinsic/util.ts';
import type {Elem} from '#src/disreact/model/elem/elem.ts';
import * as S from 'effect/Schema';
import {Keys} from '../keys';

export * as Pre from '#src/disreact/codec/intrinsic/markdown/pre.ts';
export type Pre = never;

export const TAG  = 'pre',
             NORM = TAG;

export const Children = S.Union(
  S.String,
);

export const Attributes = declareProps(
  S.Struct({
    lang: S.optional(S.String),
  }),
);

export const Element = declareElem(
  TAG,
  Attributes,
);

export const encode = (self: Elem.Rest, acc: any) => {
  if (!self.props.lang) {
    return `\`\`\`\n${acc[Keys.primitive][0]}\n\`\`\``;
  }
  return `\`\`\`${self.props.lang}\n${acc[Keys.primitive][0]}\n\`\`\``;
};
