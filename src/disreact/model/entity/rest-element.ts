import {EMPTY, ZERO} from '#src/disreact/codec/constants/common.ts';
import {RESERVED} from '#src/disreact/codec/constants/index.ts';
import type {Element} from '#src/disreact/model/entity/element.ts';



export const TAG = 'RestElement';

export * as RestElement from './rest-element.ts';

export type RestElement = Element.Meta & {
  _tag    : typeof TAG;
  type    : string;
  props   : any;
  children: Element.Any[];
};

export const Type = 'string' as const;

export type Type = string;

export const isType = (type: any): type is Type => typeof type === Type;

export const isTag = (self: Element.Any): self is RestElement => self._tag === TAG;

export const makeId = (self: RestElement, idx: number) => `${self.type}:${idx}`;

export const make = (type: string, props: any): RestElement => {
  return {
    _tag    : TAG,
    type,
    id      : '',
    idx     : type,
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
