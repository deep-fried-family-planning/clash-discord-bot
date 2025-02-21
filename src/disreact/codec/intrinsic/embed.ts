import * as DTML from '#src/disreact/codec/constants/dtml.ts';
import {Any, Boolean, Int, Literal, optional, type Schema, String, Struct} from 'effect/Schema';



export const Tag = Literal(DTML.embed);

export const Attributes = Struct({
  title      : optional(String),
  description: optional(String),
  color      : optional(Int),
  children   : optional(Any),
});



export const FieldTag = Literal(DTML.field);

export const FieldAttributes = Struct({
  name  : String,
  value : String,
  inline: optional(Boolean),
});



export const FooterTag = Literal(DTML.footer);

export const FooterAttributes = Struct({
  text: optional(String),
});



export type Tag = Schema.Type<typeof Tag>;
export type FieldTag = Schema.Type<typeof FieldTag>;
export type FooterTag = Schema.Type<typeof FooterTag>;



export type FieldAttributes = Schema.Type<typeof FieldAttributes>;
export type FooterAttributes = Schema.Type<typeof FooterAttributes>;
export type Attributes = Schema.Type<typeof Attributes>;
