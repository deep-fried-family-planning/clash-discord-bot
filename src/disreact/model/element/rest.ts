import {RESERVED} from '#src/disreact/codec/constants/index.ts';
import type {Elem} from '#src/disreact/model/element/element.ts';



export const TAG = 'RestElement';

export * as RestElement from '#src/disreact/model/element/rest.ts';

export type RestElement = Elem.Meta & {
  _tag    : typeof TAG;
  type    : string;
  props   : any;
  children: Elem[];
};

export const is = (self: Elem): self is RestElement => self._tag === TAG;

export const make = (type: string, props: any): RestElement => {
  return {
    _tag    : TAG,
    type,
    id      : '',
    idx     : '',
    step_id : '',
    props,
    children: [],
  };
};

export const clone = (self: RestElement): RestElement => {
  const {props, children, ...rest} = self;

  const reserved = {} as any;

  for (const key of RESERVED) {
    const prop = props[key];
    if (prop) {
      reserved[key] = prop;
      delete props[key];
    }
  }

  const cloned    = structuredClone(rest) as RestElement;
  cloned.props    = structuredClone(props);
  cloned.children = children;

  for (const key of Object.keys(reserved)) {
    cloned.props[key] = reserved[key];
    props[key]        = reserved[key];
  }

  return cloned;
};
