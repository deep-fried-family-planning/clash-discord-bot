import type {DisReactPointer} from '#src/disreact/codec/schema/common/common.ts';


export const make = (id: string) => Symbol(`DisReact.Pointer.${id}`);

export type Type = DisReactPointer;



const pointer = {current: null as null | DisReactPointer};

const nullPointer = Symbol(`DisReact.Pointer.Null`);



export const get     = () => pointer.current;
export const set     = (ptr: DisReactPointer) => {pointer.current = ptr};
export const unset   = () => {pointer.current = null};
export const nullify = () => {pointer.current = nullPointer};



export const current = () => {
  if (!pointer.current) {
    throw new Error('Invalid: Hooks can only be called within DisReact render functions');
  }
  return pointer.current;
};
