import {Literal, type Schema, Struct} from 'effect/Schema';
import * as DTML from '#src/disreact/codec/schema/common/dtml.ts';


export const Tag = Literal(DTML.command);

export const Attributes = Struct({});



export type Tag = Schema.Type<typeof Tag>;

export type Attributes = Schema.Type<typeof Attributes>;
