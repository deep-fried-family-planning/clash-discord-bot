import type {Elem} from './element';



export const TAG = 'Fragment';

export * as FragElement from '#src/disreact/model/entity/fragment.ts';

export type FragElement = Elem.Meta & {
  _tag: typeof TAG;
};

export const Type = 'undefined' as const;

export type Type = undefined;

export const isType = (type: any) => typeof type === Type;

export const is = (self: Elem | FragElement): self is FragElement => self._tag === TAG;

export const make = (type: undefined, props: any) => props.children;
