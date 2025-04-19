import {declareElem, declareProps} from '#src/disreact/codec/intrinsic/util.ts';
import {S} from '#src/disreact/utils/re-exports.ts';
import type {Elem} from '#src/disreact/model/elem/elem.ts';

export * as Author from '#src/disreact/codec/intrinsic/embed/author.ts';
export type Author = never;

export const TAG  = 'author',
             NORM = TAG;

export const Children = S.Undefined;

export const Attributes = declareProps(
  S.Struct({
    name: S.String,
    url : S.optional(S.String),
  }),
);

export const Element = declareElem(
  TAG,
  Attributes,
);

export const encode = (self: Elem.Rest, acc: any) => {
  return {
    name: self.props.name,
    url : self.props.url,
  };
};
