import {Keys} from '#src/disreact/codec/intrinsic/keys.ts';
import {declareElem, declareProps} from '#src/disreact/codec/intrinsic/util.ts';

import * as S from 'effect/Schema';

export * as Img from '#src/disreact/codec/intrinsic/embed/img.ts';
export type Img = never;

export const TAG  = 'img',
             NORM = Keys.image;

export const Children = S.Undefined;

export const Attributes = declareProps(
  S.Struct({
    url: S.String,
  }),
);

export const Element = declareElem(TAG, Attributes);

export const encode = (self: any, acc: any) => {
  return {
    url: self.props.url,
  };
};
