import type {Cx, Ex, Vc} from '#discord/entities/index.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import type {AnyE} from '#src/internal/types.ts';


export type VoidOrVoidEffect = () => void | AnyE<void>;


export type ViewNodeDialogOutput = readonly [
  {
    route    : Cx.Type['route'];
    title    : str;
    onSubmit?: VoidOrVoidEffect;
    onOpen?  : VoidOrVoidEffect;
  },
  ...Vc.Type[][],
];


export type ViewNodeMessageOutput =
  | readonly [Ex.Type, ...Vc.Type[][]]
  | readonly [Ex.Type, Ex.Type, ...Vc.Type[][]]
  | readonly [Ex.Type, Ex.Type, Ex.Type, ...Vc.Type[][]]
  | readonly [Ex.Type, Ex.Type, Ex.Type, Ex.Type, ...Vc.Type[][]]
  | readonly [Ex.Type, Ex.Type, Ex.Type, Ex.Type, Ex.Type, ...Vc.Type[][]];


export type ViewNodeOutput =
  ViewNodeDialogOutput
  | ViewNodeMessageOutput;
