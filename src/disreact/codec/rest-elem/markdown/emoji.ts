import {declareElem, declareProps} from '#src/disreact/codec/rest-elem/util.ts';
import {S} from '#src/disreact/utils/re-exports.ts';
import type {Elem} from '#src/disreact/model/entity/elem.ts';

export * as Emoji from '#src/disreact/codec/rest-elem/markdown/emoji.ts';
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

export const encode = (self: Elem, acc: any) => {
  return {
    name    : self.props.name,
    id      : self.props.id,
    animated: self.props.animated,
  };
};
