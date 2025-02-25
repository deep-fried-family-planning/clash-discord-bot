import type * as FunctionElement from '../element/function-element.ts';
import type * as Pointer from './pointer.ts';



const enum RootKind {
  ENTRYPOINT = 'ENTRYPOINT',
  EPHEMERAL  = 'EPHEMERAL',
  DIALOG     = 'DIALOG',
}



export type Type = {
  kind   : RootKind;
  name   : string;
  pointer: Pointer.Type;
  element: FunctionElement.Type;
};



export const make = () => ({

});
