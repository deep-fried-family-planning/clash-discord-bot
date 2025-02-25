import type * as FunctionElement from '../element/function-element.ts';



export type Type = {
  static_id    : string;
  component    : FunctionElement.FEC;
  isEntrypoint?: boolean | undefined;
  isEphemeral? : boolean | undefined;
  isDialog?    : boolean | undefined;
  isSync?      : boolean | undefined;
  isAsync?     : boolean | undefined;
  isEffect?    : boolean | undefined;
};



export const make = (fn: FunctionElement.FEC): Type => {
  return {
    static_id: fn.static_id ?? fn.displayName ?? fn.name,
    component: fn,
    isEffect : fn.isEffect,
    isAsync  : fn.isAsync,
    isSync   : fn.isSync,
  };
};
