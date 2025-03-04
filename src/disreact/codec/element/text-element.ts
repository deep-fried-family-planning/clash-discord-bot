import * as All from '#src/disreact/codec/constants/all.ts';
import type * as FunctionElement from '#src/disreact/codec/element/function-element.ts';
import type * as IntrinsicElement from '#src/disreact/codec/element/intrinsic-element.ts';



export const TAG = 'TextElement';

export type TextElement = {
  _tag : typeof TAG;
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
    | TextElement
    | IntrinsicElement.IntrinsicElement
    | FunctionElement.FunctionElement
    )[];
};

export const is = (type: any): type is TextElement => type._tag === TAG;

export const make = (type: string): TextElement => {
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

export const makeDEV = make;
