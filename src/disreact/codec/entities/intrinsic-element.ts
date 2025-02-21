/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import * as All from '#src/disreact/codec/constants/all.ts';
import * as Intrinsic from '#src/disreact/codec/intrinsic/index.ts';
import type * as FunctionElement from '#src/disreact/codec/entities/function-element.ts';
import type * as TextElement from '#src/disreact/codec/entities/text-element.ts';



export type Type = {
  _tag : typeof All.IntrinsicElementTag;
  _name: string;
  meta : {
    id          : string;
    idx         : number;
    step_id     : string;
    full_id     : string;
    graph_id?   : string;
    isModal?    : boolean | undefined;
    isRoot?     : boolean | undefined;
    isMessage?  : boolean | undefined;
    isEphemeral?: boolean | undefined;
  };
  props   : any;
  children: (
    | Type
    | FunctionElement.Type
    | TextElement.Type
  )[];
};

export const is = (type: any): type is Type => type._tag === All.IntrinsicElementTag;

export const make = (type: string, props: any): Type => {
  return {
    _tag : All.IntrinsicElementTag as typeof All.IntrinsicElementTag,
    _name: type,
    meta : {
      id     : All.Empty,
      idx    : All.Zero,
      step_id: All.Empty,
      full_id: All.Empty,
    },
    props,
    children: [] as any[],
  };
};

export const dsxDEV_make = (type: string, props: any): Type => {
  const validator = Intrinsic.dsxDEV_validators[type as keyof typeof Intrinsic.dsxDEV_validators];

  if (validator) {
    validator(props);
  }

  return make(type, props);
};
