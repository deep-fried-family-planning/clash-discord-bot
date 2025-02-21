import type * as FunctionElement from 'src/disreact/codec/schema/entities/function-element.ts';
import type * as IntrinsicElement from 'src/disreact/codec/schema/entities/intrinsic-element.ts';
import type * as TextElement from 'src/disreact/codec/schema/entities/text-element.ts';


export type Type =
  | TextElement.Type
  | IntrinsicElement.Type
  | FunctionElement.Type;
