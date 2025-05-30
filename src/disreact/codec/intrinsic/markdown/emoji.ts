import {declareElem, declareProps} from '#src/disreact/codec/intrinsic/util.ts';

import * as S from 'effect/Schema';

export * as Emoji from '#src/disreact/codec/intrinsic/markdown/emoji.ts';
export type Emoji = never;

export const TAG  = 'emoji',
             NORM = TAG;

export const Children = S.Union(
  S.String,
);

export const Attributes = declareProps(
  S.Struct({
    name    : S.optional(S.String),
    id      : S.optional(S.String),
    animated: S.optional(S.Boolean),
  }),
);

export const Element = declareElem(
  TAG,
  Attributes,
);

export const encode = (self: any, acc: any) => {
  return {
    name    : self.props.name,
    id      : self.props.id,
    animated: self.props.animated,
  };
};
