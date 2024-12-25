import {type Ex, ShallowProxy} from '#dfdis';
import {D} from '#src/internal/pure/effect.ts';
import type {str} from '#src/internal/pure/types-pure.ts';


type Vembedmeta = {
    name: str;
};

export type Vembed = D.TaggedEnum<{
    Constant: Vembedmeta & {v: Ex.T[]};
    Function: Vembedmeta & {v: <P>(props: P) => Ex.T[]};
}>;
export const vembed = D.taggedEnum<Vembed>();


export const shallow = vembed.$match({
    Constant: (vc) => vc.v,
    Function: (vc) => vc.v(ShallowProxy.make()),
});
