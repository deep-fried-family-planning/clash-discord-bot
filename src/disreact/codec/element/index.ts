export * as Children from './children.ts';
export * as Function from './function-element.ts';
export * as Text from './text-element.ts';
export * as Intrinsic from './intrinsic-element.ts';
export * as Props from './props.ts';
import type * as Function from './function-element.ts';
import type * as Intrinsic from './intrinsic-element.ts';
import * as Text from './text-element.ts';


export type Element =
  | Function.Type
  | Text.Type
  | Intrinsic.Type;


export const isSame = <A extends Element>(a: A, b: A): b is typeof a => {
  if (a._tag !== b._tag) return false;
  if (a._name !== b._name) return false;
  if (a.meta.id !== b.meta.id) return false;
  if (Text.is(a)) return a.value === (b as Text.Type).value;
  return true;
};
