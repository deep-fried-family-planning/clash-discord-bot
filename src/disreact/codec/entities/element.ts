import type * as FunctionElement from '#src/disreact/codec/entities/function-element.ts';
import type * as IntrinsicElement from '#src/disreact/codec/entities/intrinsic-element.ts';
import type * as TextElement from '#src/disreact/codec/entities/text-element.ts';


export type Type =
  | TextElement.Type
  | IntrinsicElement.Type
  | FunctionElement.Type;
