import type * as FunctionElement from '#src/disreact/codec/element/function-element.ts';
import type * as IntrinsicElement from '#src/disreact/codec/element/intrinsic-element.ts';
import type * as TextElement from '#src/disreact/codec/element/text-element.ts';



export type RenderFn = (props: any) => any;

export type Pragma =
  | TextElement.Type
  | IntrinsicElement.Type
  | FunctionElement.Type;
