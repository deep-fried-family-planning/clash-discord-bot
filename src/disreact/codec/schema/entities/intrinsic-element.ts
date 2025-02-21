import * as All from '#src/disreact/codec/schema/common/all.ts';
import type * as Element from 'src/disreact/codec/schema/entities/element.ts';



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
      idx    : All.NotSetInt,
      step_id: All.NotSet,
      full_id: All.NotSet,
    },
    props,
    children: [] as any[],
  };
};
