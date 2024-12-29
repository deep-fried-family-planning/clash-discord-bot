import type {Cx, Ex, Vc} from '#discord/entities/index.ts';
import type {str} from '#src/internal/pure/types-pure.ts';


export type ViewNodeDialogOutput = {
  route     : Cx.Type['route'];
  title     : str;
  components: Cx.Type[][];
};


export type ViewNodeMessageOutput =
  | readonly [Ex.Type, ...Vc.Type[][]]
  | readonly [Ex.Type, Ex.Type, ...Vc.Type[][]]
  | readonly [Ex.Type, Ex.Type, Ex.Type, ...Vc.Type[][]]
  | readonly [Ex.Type, Ex.Type, Ex.Type, Ex.Type, ...Vc.Type[][]]
  | readonly [Ex.Type, Ex.Type, Ex.Type, Ex.Type, Ex.Type, ...Vc.Type[][]];


export type ViewNodeOutput =
  | readonly [ViewNodeDialogOutput, ...Vc.Type[][]]
  | readonly [Ex.Type, ...Vc.Type[][]]
  | readonly [Ex.Type, Ex.Type, ...Vc.Type[][]]
  | readonly [Ex.Type, Ex.Type, Ex.Type, ...Vc.Type[][]]
  | readonly [Ex.Type, Ex.Type, Ex.Type, Ex.Type, ...Vc.Type[][]]
  | readonly [Ex.Type, Ex.Type, Ex.Type, Ex.Type, Ex.Type, ...Vc.Type[][]];
