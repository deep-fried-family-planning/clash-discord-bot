/* eslint-disable @typescript-eslint/no-dynamic-delete */
import * as All from '#src/disreact/codec/constants/all.ts';
import * as Reserved from '#src/disreact/codec/constants/reserved.ts';
import * as Intrinsic from '#src/disreact/codec/element/intrinsic/index.ts';
import type * as Element from './element.ts';



export const TAG = 'IntrinsicElement';

export type T = {
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
  children: Element.T[];
};

export const is = (type: any): type is T => type._tag === TAG;

export const make = (type: string, props: any): T => {
  return {
    _tag : TAG,
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

const reservedProps = [
  Reserved.onclick,
  Reserved.onselect,
  Reserved.ondeselect,
  Reserved.onsubmit,
  Reserved.oninvoke,
  Reserved.onautocomplete,
];

export const clone = (self: T): T => {
  const {props, children, ...rest} = self;

  const reserved = {} as any;

  for (const key of reservedProps) {
    const prop = props[key];
    if (prop) {
      reserved[key] = prop;
      delete props[key];
    }
  }

  const cloned    = structuredClone(rest) as T;
  cloned.props    = structuredClone(props);
  cloned.children = children;

  for (const key of Object.keys(reserved)) {
    cloned.props[key] = reserved[key];
    props[key]        = reserved[key];
  }

  return cloned;
};

export const encode = (self: T) => {
  return self;
};



export const makeDEV = (type: string, props: any): T => {
  const validator = Intrinsic.validateAttributesDEV[type as keyof typeof Intrinsic.validateAttributesDEV];

  if (!validator) {
    throw new Error(`Unknown intrinsic element type: ${type}`);
  }

  return make(type, validator(props));
};
