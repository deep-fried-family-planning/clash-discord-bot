import {type Cx, ShallowProxy} from '#dfdis';
import {D} from '#src/internal/pure/effect.ts';
import type {str} from '#src/internal/pure/types-pure.ts';


export type Vcomponent = D.TaggedEnum<{
    Constant: {name: str; view: Cx.T[]};
    Function: {name: str; view: <P>(props: P) => Cx.T[]};
}>;
export const vcomponent = D.taggedEnum<Vcomponent>();


export const shallow = vcomponent.$match({
    Constant: (vc) => vc.view,
    Function: (vc) => vc.view(ShallowProxy.make()),
});
