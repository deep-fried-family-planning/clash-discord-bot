import {Keys} from '#src/disreact/codec/rest-elem/keys.ts';
import {declareElem, declareProps} from '#src/disreact/codec/rest-elem/util.ts';
import {S} from '#src/disreact/utils/re-exports.ts';
import type {Elem} from '#src/disreact/model/elem/elem.ts';
import {DAPIComponent} from '#src/disreact/codec/dapi/dapi-component';

export * as TextInput from '#src/disreact/codec/rest-elem/component/textinput.ts';
export type TextInput = never;

export const TAG  = 'textinput',
             NORM = Keys.components;

export const Children = S.Union(
  S.String,
);

export const Attributes = declareProps(
  S.Struct({
    custom_id  : S.optional(S.String),
    label      : S.optional(S.String),
    style      : S.optional(S.Literal(DAPIComponent.SHORT, DAPIComponent.PARAGRAPH)),
    min_length : S.optional(S.Number),
    max_length : S.optional(S.Number),
    required   : S.optional(S.Boolean),
    value      : S.optional(S.String),
    placeholder: S.optional(S.String),
  }),
);

export const Element = declareElem(
  TAG,
  Attributes,
);

export const encode = (self: Elem.Rest, acc: any) => {
  return {
    type      : DAPIComponent.ACTION_ROW,
    components: [{
      type       : DAPIComponent.TEXT_INPUT,
      custom_id  : self.props.custom_id ?? self.ids,
      style      : self.props.style ?? DAPIComponent.SHORT,
      label      : self.props.label,
      min_length : self.props.min_length,
      max_length : self.props.max_length,
      required   : self.props.required,
      value      : self.props.value ?? acc[Keys.primitive],
      placeholder: self.props.placeholder,
    }],
  };
};
