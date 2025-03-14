import {EMPTY, ZERO} from '#src/disreact/codec/constants/common.ts';
import type {Element} from '#src/disreact/model/entity/element.ts';



export const TAG = 'TextLeaf';

export * as TextLeaf from '#src/disreact/model/entity/text-leaf.ts';

export type TextLeaf = {
  _tag : typeof TAG;
  value: string;
};

export const is = (type: Element.Any): type is TextLeaf => type._tag === TAG;

export const isType = (type: any): type is string => typeof type === 'string';

export const make = (value: string): TextLeaf => {
  return {
    _tag: TAG,
    value,
  };
};

export const clone = (self: TextLeaf): TextLeaf => structuredClone(self);

export const encode = (self: TextLeaf) => self.value;
