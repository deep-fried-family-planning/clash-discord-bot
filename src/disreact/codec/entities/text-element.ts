import * as All from '#src/disreact/codec/constants/all.ts';
import type * as FunctionElement from '#src/disreact/codec/entities/function-element.ts';
import type * as IntrinsicElement from '#src/disreact/codec/entities/intrinsic-element.ts';



export type Type = {
  _tag : typeof All.TextElementTag;
  _name: string;
  meta: {
    idx         : number;
    id          : string;
    step_id     : string;
    full_id     : string;
    isModal?    : never;
    isRoot?     : never;
    isMessage?  : never;
    isEphemeral?: never;
  };
  value   : string;
  props   : any;
  children: (
    | Type
    | IntrinsicElement.Type
    | FunctionElement.Type
    )[];
};

export const is = (type: any): type is Type => type._tag === All.TextElementTag;

export const make = (type: string): Type => {
  return {
    _tag : All.TextElementTag,
    _name: 'string',
    meta : {
      idx    : All.Zero,
      id     : All.Empty,
      step_id: All.Empty,
      full_id: All.Empty,
    },
    value   : type,
    props   : {},
    children: [],
  };
};

export const dsxDEV_make = make;
