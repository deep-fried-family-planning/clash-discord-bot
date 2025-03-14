import {EMPTY, ZERO} from '#src/disreact/codec/constants/common.ts';
import type {Element} from '#src/disreact/model/entity/element.ts';



export const TAG = 'TextElement';

export * as TextLeaf from '#src/disreact/model/entity/text-element.ts';

export type TextElement = {
  _tag : typeof TAG;
  value: string;
};

export const is = (type: Element.Any): type is TextElement => type._tag === TAG;

export const isType = (type: any): type is string => typeof type === 'string';

export const make = (value: string): TextElement => {
  return {
    _tag: TAG,
    value,
  };
};

export const clone = (self: TextElement): TextElement => structuredClone(self);

export const encode = (self: TextElement) => self.value;
