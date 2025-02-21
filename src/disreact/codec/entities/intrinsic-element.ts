import * as All from '#src/disreact/codec/constants/all.ts';
import type * as Element from '#src/disreact/codec/entities/element.ts';



export type Type = {
  _tag : typeof All.IntrinsicElementTag;
  _name: string;
  meta : {
    id     : string;
    idx    : number;
    step_id: string;
    full_id: string;
    isRoot?: boolean;
  };
  props   : any;
  children: Element.Type[];
};



export const make = (type: string, props: any): Type => {
  return {
    _tag : All.IntrinsicElementTag as typeof All.IntrinsicElementTag,
    _name: type,
    meta : {
      id     : All.NotSet,
      idx    : 0,
      step_id: '',
      full_id: '',
    },
    props,
    children: [] as any[],
  };
};
