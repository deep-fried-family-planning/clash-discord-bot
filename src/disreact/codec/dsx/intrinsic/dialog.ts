import {CustomId} from '#src/disreact/codec/common/value.ts';
import * as DTML from '#src/disreact/codec/common/dtml.ts';
import {S} from '#src/internal/pure/effect.ts';



export const Tag = S.Literal(DTML.dialog, DTML.modal);

export const Attributes = S.Struct({
  custom_id: S.optional(S.String),
  title    : S.String,
  onsubmit : S.optional(S.Unknown),
  children : S.optional(S.Any),
});



export const TextInputTag = S.Literal(DTML.text, DTML.textarea, DTML.textinput);

export const TextInputAttributes = S.Struct({
  custom_id  : S.optional(CustomId),
  placeholder: S.optional(S.String),
  required   : S.optional(S.Boolean),
  min_length : S.optional(S.Int),
  max_length : S.optional(S.Int),
  label      : S.String,
  value      : S.String,
});



export type Tag = S.Schema.Type<typeof Tag>;
export type TextInputTag = S.Schema.Type<typeof TextInputTag>;



export type Attributes = S.Schema.Type<typeof Attributes>;
export type TextInputAttributes = S.Schema.Type<typeof TextInputAttributes>;



export const dsxDEV_validators_attributes = {
  [DTML.dialog]   : S.validateSync(Attributes),
  [DTML.modal]    : S.validateSync(Attributes),
  [DTML.text]     : S.validateSync(TextInputAttributes),
  [DTML.textarea] : S.validateSync(TextInputAttributes),
  [DTML.textinput]: S.validateSync(TextInputAttributes),
};
