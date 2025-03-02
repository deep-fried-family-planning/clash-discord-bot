import {S} from '#src/internal/pure/effect.ts';



export const T = S.Symbol;

export type T = S.Schema.Type<typeof T>;

export const make = (id: string): T => Symbol(`DisReact.Pointer.${id}`);

export const Null = Symbol(`DisReact.Pointer.Null`);
