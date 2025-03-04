export * as Children from './children.ts';
export * as Function from './function-element.ts';
export * as Text from './text-element.ts';
export * as Intrinsic from './intrinsic-element.ts';
export * as Props from './props.ts';
export * as Fragment from './fragment.ts';
import * as FunctionElement from './function-element.ts';
import * as IntrinsicElement from './intrinsic-element.ts';
import * as TextElement from './text-element.ts';



export type T =
  | FunctionElement.T
  | IntrinsicElement.T
  | TextElement.T;



export const isSame = <A extends T, B extends T>(a: A, b: B): boolean => {
  if (a._tag !== b._tag) {
    return false;
  }

  if (a._name !== b._name) {
    return false;
  }

  if (a.meta.id !== b.meta.id) {
    return false;
  }

  if (TextElement.is(a)) {
    return a.value === (b as TextElement.T).value;
  }

  return true;
};



export const clone = (self: T): T => {
  if (TextElement.is(self)) {
    return TextElement.clone(self);
  }

  if (IntrinsicElement.is(self)) {
    return IntrinsicElement.clone(self);
  }

  return FunctionElement.clone(self);
};



export const encode = (self: T) => {
  if (TextElement.is(self)) {
    return TextElement.encode(self);
  }

  if (IntrinsicElement.is(self)) {
    return IntrinsicElement.encode(self);
  }

  return FunctionElement.encode(self);
};
