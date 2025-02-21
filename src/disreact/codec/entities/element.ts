import type * as FunctionElement from './function-element.ts';
import type * as IntrinsicElement from './intrinsic-element.ts';
import type * as TextElement from './text-element.ts';


export type Type =
  | TextElement.Type
  | IntrinsicElement.Type
  | FunctionElement.Type;
