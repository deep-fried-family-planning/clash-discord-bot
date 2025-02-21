import * as All from '#src/disreact/codec/schema/common/all.ts';
import type * as Element from './element.ts';



export type Type = {
  _tag : typeof All.TextElementTag;
  _name: string;
  meta : {
    id     : string;
    idx    : number;
    step_id: string;
    full_id: string;
    isRoot?: boolean;
  };
  value   : string;
  props   : any;
  children: Element.Type[];
};



export const make = (type: string): Type => {
  return {
    _tag : All.TextElementTag,
    _name: 'string',
    meta : {
      id     : All.NotSet,
      idx    : All.NotSetInt,
      step_id: All.NotSet,
      full_id: All.NotSet,
    },
    value   : type,
    props   : {},
    children: [],
  };
};
