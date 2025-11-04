import * as Norm from '#src/disreact/codec/intrinsic/norm.ts';
import * as Rest from '#src/disreact/codec/intrinsic/rest-element.ts';
import {Discord} from 'dfx';
import * as S from 'effect/Schema';

export const TEXT_INPUT = 'textinput';
export const TextInputAttributes = Rest.Attributes({
  custom_id  : S.optional(S.String),
  label      : S.optional(S.String),
  style      : S.optional(S.Literal(1, 2)),
  min_length : S.optional(S.Number),
  max_length : S.optional(S.Number),
  required   : S.optional(S.Boolean),
  value      : S.optional(S.String),
  placeholder: S.optional(S.String),
});
export const encodeTextInput = (self: any, acc: any) => {
  return {
    type      : Discord.MessageComponentTypes.ACTION_ROW,
    components: [{
      type       : Discord.MessageComponentTypes.TEXT_INPUT,
      custom_id  : self.props.custom_id ?? self.ids,
      style      : self.props.style ?? Discord.TextInputStyleTypes.SHORT,
      label      : self.props.label,
      min_length : self.props.min_length,
      max_length : self.props.max_length,
      required   : self.props.required,
      value      : self.props.value ?? acc[Norm.PRIMITIVE]?.[0],
      placeholder: self.props.placeholder,
    }],
  };
};

export const MODAL = 'modal';
export const ModalAttributes = Rest.Attributes({
  custom_id: S.optional(S.String),
  title    : S.String,
  onsubmit : Rest.Handler(S.Any),
});
export const encodeModal = (self: any, acc: any) => {
  return {
    custom_id : self.props.custom_id ?? self.ids,
    title     : self.props.title,
    components: acc[Norm.COMPONENTS],
  };
};

export type TextInputAttributes = typeof TextInputAttributes.Type;
export type ModalAttributes = typeof ModalAttributes.Type;
