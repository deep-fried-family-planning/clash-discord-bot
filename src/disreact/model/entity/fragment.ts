import type {Element} from './element';



export const TAG = 'Fragment';

export * as FragElement from 'src/disreact/model/entity/frag-element.ts';

export type FragElement = Element.Meta & {
  _tag: typeof TAG;
};

export const Type = 'undefined' as const;

export type Type = undefined;

export const isType = (type: any) => typeof type === Type;

export const is = (self: Element | FragElement): self is FragElement => self._tag === TAG;

export const make = (type: undefined, props: any) => props.children;
