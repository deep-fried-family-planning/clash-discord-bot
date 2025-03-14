import type {Elem} from '#src/disreact/model/element/element.ts';



export const TAG = 'Leaf';

export * as LeafElem from '#src/disreact/model/element/leaf.ts';
export type LeafElem<V = string> = {
  _tag    : typeof TAG;
  value   : V;
  props   : {};
  children: [];
};

export const is = (type: Elem): type is LeafElem => type._tag === TAG;

export const make = (value: string): LeafElem => {
  return {
    _tag: TAG,
    value,
  } as any;
};

export const clone = (self: LeafElem): LeafElem => structuredClone(self);

export const encode = (self: LeafElem) => self.value;
