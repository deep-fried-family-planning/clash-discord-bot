import * as DTML from '#src/disreact/codec/common/dtml.ts';
import {S} from '#src/internal/pure/effect.ts';



export const Tag = S.Literal(DTML.embed);

export const Attributes = S.Struct({
  title      : S.optional(S.String),
  description: S.optional(S.String),
  color      : S.optional(S.Int),
  children   : S.optional(S.Any),
});



export const FieldTag = S.Literal(DTML.field);

export const FieldAttributes = S.Struct({
  name  : S.String,
  value : S.String,
  inline: S.optional(S.Boolean),
});



export const FooterTag = S.Literal(DTML.footer);

export const FooterAttributes = S.Struct({
  text: S.optional(S.String),
});



export type Tag = S.Schema.Type<typeof Tag>;
export type FieldTag = S.Schema.Type<typeof FieldTag>;
export type FooterTag = S.Schema.Type<typeof FooterTag>;



export type FieldAttributes = S.Schema.Type<typeof FieldAttributes>;
export type FooterAttributes = S.Schema.Type<typeof FooterAttributes>;
export type Attributes = S.Schema.Type<typeof Attributes>;



export const dsxDEV_validators_attributes = {
  [DTML.embed] : S.validateSync(Attributes),
  [DTML.field] : S.validateSync(FieldAttributes),
  [DTML.footer]: S.validateSync(FooterAttributes),
};
