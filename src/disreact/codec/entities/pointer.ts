import type {DisReactPointer} from '#src/disreact/codec/schema/common/common.ts';



export const make = (id: string) => Symbol(`DisReact.Pointer.${id}`);

export const Null = Symbol(`DisReact.Pointer.Null`);

export type Type = DisReactPointer;
