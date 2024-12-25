import {D} from '#src/internal/pure/effect.ts';
import type {str, unk} from '#src/internal/pure/types-pure.ts';
import {ShallowProxy} from '..';


type Vframemeta = {
    name: str;
};

export type Vframe = D.TaggedEnum<{
    Frame: Vframemeta & {v: <P>(props: P) => unk};
}>;
export const vframe = D.taggedEnum<Vframe>();


export const shallow = vframe.$match({
    Frame: (vf) => vf.v(ShallowProxy.make()),
});
