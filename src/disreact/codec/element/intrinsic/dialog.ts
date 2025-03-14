import {CustomId} from '#src/disreact/codec/constants/common.ts';
import * as DTML from '#src/disreact/codec/constants/dtml.ts';
import {Any, Boolean, Int, Literal, optional, type Schema, String, Struct, Unknown, validateSync} from 'effect/Schema';



export const Tag = Literal(DTML.dialog, DTML.modal);

export const Attributes = Struct({
  custom_id: optional(String),
  title    : String,
  onsubmit : optional(Unknown),
  children : optional(Any),
});



export const TextInputTag = Literal(DTML.text, DTML.textarea, DTML.textinput);

export const TextInputAttributes = Struct({
  custom_id  : optional(CustomId),
  placeholder: optional(String),
  required   : optional(Boolean),
  min_length : optional(Int),
  max_length : optional(Int),
  label      : String,
  value      : optional(String),
});



export type Tag = Schema.Type<typeof Tag>;
export type TextInputTag = Schema.Type<typeof TextInputTag>;



export type Attributes = Schema.Type<typeof Attributes>;
export type TextInputAttributes = Schema.Type<typeof TextInputAttributes>;



export const validateAttributesDEV = {
  [DTML.dialog]   : validateSync(Attributes),
  [DTML.modal]    : validateSync(Attributes),
  [DTML.text]     : validateSync(TextInputAttributes),
  [DTML.textarea] : validateSync(TextInputAttributes),
  [DTML.textinput]: validateSync(TextInputAttributes),
};
