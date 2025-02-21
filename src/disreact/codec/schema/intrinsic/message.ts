import * as DTML from '#src/disreact/codec/schema/common/dtml.ts';
import {Any, Boolean, Literal, optional, type Schema, Struct} from 'effect/Schema';



export const Tag = Literal(DTML.message);

export const Attributes = Struct({
  public   : optional(Boolean),
  ephemeral: optional(Boolean),
  children : optional(Any),
});



export const ActionRowTag = Literal(DTML.actions, DTML.buttons);

export const ActionRowAttributes = Struct({});



export type Tag = Schema.Type<typeof Tag>;
export type ActionRowTag = Schema.Type<typeof ActionRowTag>;


export type Attributes = Schema.Type<typeof Attributes>;
export type ActionRowAttributes = Schema.Type<typeof ActionRowAttributes>;
