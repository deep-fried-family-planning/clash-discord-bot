import {Keys} from '#src/disreact/codec/rest-elem/keys.ts';
import {Emoji} from '#src/disreact/codec/rest-elem/markdown/emoji.ts';
import {declareElem, declareProps} from '#src/disreact/codec/rest-elem/util.ts';
import {S} from '#src/disreact/utils/re-exports.ts';
import type {Elem} from '#src/disreact/model/entity/elem.ts';

export * as Option from '#src/disreact/codec/rest-elem/component/option.ts';
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

export const encode = (self: Elem, acc: any) => {
  return {
    value      : self.props.value,
    label      : self.props.label,
    description: self.props.description ?? acc[Keys.primitive]?.[0],
    emoji      : self.props.emoji ?? acc[Keys.emoji]?.[0],
    default    : self.props.default,
  };
};
