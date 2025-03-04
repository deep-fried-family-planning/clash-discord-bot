/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import * as All from '#src/disreact/codec/constants/all.ts';
import type * as FunctionElement from '#src/disreact/codec/element/function-element.ts';
import * as Intrinsic from '#src/disreact/codec/element/intrinsic/index.ts';
import type * as TextElement from '#src/disreact/codec/element/text-element.ts';



export const TAG = 'IntrinsicElement';

export type IntrinsicElement = {
  _tag : typeof TAG;
  _name: string;
  meta: {
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
    | IntrinsicElement
    | FunctionElement.FunctionElement
    | TextElement.TextElement
    )[];
};

export const is = (type: any): type is IntrinsicElement => type._tag === TAG;

export const make = (type: string, props: any): IntrinsicElement => {
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

export const makeDEV = (type: string, props: any): IntrinsicElement => {
  const validator = Intrinsic.dsxDEV_validators[type as keyof typeof Intrinsic.dsxDEV_validators];

  if (validator) {
    validator(props);
  }

  return make(type, props);
};
