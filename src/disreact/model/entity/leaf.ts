import type {Elem} from '#src/disreact/model/entity/element.ts';



export const TAG = 'Leaf';

export * as LeafElem from '#src/disreact/model/entity/leaf.ts';
export type LeafElem<V = string> = {
  _tag : typeof TAG;
  value: V;
  props: {};
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
