import * as DTML from '#src/disreact/codec/common/dtml.ts';
import {S} from '#src/internal/pure/effect.ts';



export const Tag = S.Literal(DTML.message);

export const Attributes = S.Struct({
  public   : S.optional(S.Boolean),
  ephemeral: S.optional(S.Boolean),
  children : S.optional(S.Any),
});



export const ActionRowTag = S.Literal(DTML.actions, DTML.buttons);

export const ActionRowAttributes = S.Struct({});



export type Tag = S.Schema.Type<typeof Tag>;
export type ActionRowTag = S.Schema.Type<typeof ActionRowTag>;


export type Attributes = S.Schema.Type<typeof Attributes>;
export type ActionRowAttributes = S.Schema.Type<typeof ActionRowAttributes>;



export const dsxDEV_validators_attributes = {
  [DTML.message]: S.validateSync(Attributes),
  [DTML.actions]: S.validateSync(ActionRowAttributes),
  [DTML.buttons]: S.validateSync(ActionRowAttributes),
};
