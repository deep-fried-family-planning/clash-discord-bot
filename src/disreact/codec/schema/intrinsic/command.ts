import {DTML} from '#src/disreact/dsx/index.ts';
import {Literal, type Schema, Struct} from 'effect/Schema';



export const Tag = Literal(DTML.command);

export const Attributes = Struct({});



export type Tag = Schema.Type<typeof Tag>;

export type Attributes = Schema.Type<typeof Attributes>;
