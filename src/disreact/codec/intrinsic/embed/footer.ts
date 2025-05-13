import {Keys} from '#src/disreact/codec/intrinsic/keys.ts';
import {declareElem, declareProps} from '#src/disreact/codec/intrinsic/util.ts';
import type {Elem} from '#src/disreact/model/elem/elem.ts';
import * as S from 'effect/Schema';

export * as Footer from '#src/disreact/codec/intrinsic/embed/footer.ts';
export type Footer = never;

export const TAG  = 'footer',
             NORM = TAG;

export const Children = S.Undefined;

export const Attributes = declareProps(
  S.Struct({
    text: S.optional(S.String),
  }),
);

export const Element = declareElem(
  TAG,
  Attributes,
);

export const encode = (self: Elem.Rest, acc: any) => {
  return {
    text: self.props.text ?? acc[Keys.primitive]?.join(''),
  };
};
