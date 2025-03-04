import type {Schema} from 'effect/Schema';
import {SymbolFromSelf} from 'effect/Schema';



export const T = SymbolFromSelf;

export type T = Schema.Type<typeof T>;

export const make = (id: string) => Symbol(`DisReact.Pointer.${id}`);

export const Null = Symbol(`DisReact.Pointer.Null`);
