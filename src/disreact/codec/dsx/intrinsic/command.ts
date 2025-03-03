import * as DTML from '#src/disreact/codec/common/dtml.ts';
import {S} from '#src/internal/pure/effect.ts';


export const Tag = S.Literal(DTML.command);

export const Attributes = S.Struct({});



export type Tag = S.Schema.Type<typeof Tag>;

export type Attributes = S.Schema.Type<typeof Attributes>;



export const dsxDEV_validators_attributes = {
  [DTML.command]: S.validateSync(Attributes),
};
