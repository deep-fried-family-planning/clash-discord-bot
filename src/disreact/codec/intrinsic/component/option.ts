import {Keys} from '#src/disreact/codec/intrinsic/keys.ts';
import {Emoji} from '#src/disreact/codec/intrinsic/markdown/emoji.ts';
import {declareElem, declareProps} from '#src/disreact/codec/intrinsic/util.ts';
import type {Elem} from '#src/disreact/model/elem/elem.ts';
import {S} from '#src/disreact/utils/re-exports.ts';

export * as Option from '#src/disreact/codec/intrinsic/component/option.ts';
export type Option = never;

export const TAG  = 'option',
             NORM = Keys.options;

export const Children = S.Union(
  S.String,
  Emoji.Element,
);

export const Attributes = declareProps(
  S.Struct({
    label      : S.String,
    value      : S.String,
    description: S.optional(S.String),
    emoji      : S.optional(Emoji.Attributes),
    default    : S.optional(S.Boolean),
  }),
);

export const Element = declareElem(
  TAG,
  Attributes,
);

export const encode = (self: Elem.Rest, acc: any) => {
  return {
    value      : self.props.value,
    label      : self.props.label,
    description: self.props.description ?? acc[Keys.primitive]?.[0],
    emoji      : self.props.emoji ?? acc[Keys.emoji]?.[0],
    default    : self.props.default,
  };
};
