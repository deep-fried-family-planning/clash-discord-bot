import * as DTML from '#src/disreact/codec/constants/dtml.ts';
import {Literal, type Schema, Struct, validateSync} from 'effect/Schema';


export const Tag = Literal(DTML.command);

export const Attributes = Struct({});



export type Tag = Schema.Type<typeof Tag>;

export type Attributes = Schema.Type<typeof Attributes>;



export const validateAttributesDEV = {
  [DTML.command]: validateSync(Attributes),
};
