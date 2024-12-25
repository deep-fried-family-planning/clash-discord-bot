import type {Vframe} from '#discord/entities/vframe.ts';
import {D} from '#src/internal/pure/effect.ts';
import type {str, unk} from '#src/internal/pure/types-pure.ts';
import {ShallowProxy} from '..';


type Vnodemeta = {
    name: str;
};

export type Vnode = D.TaggedEnum<{
    Root: Vnodemeta & {v: (props: unk) => Vframe};
    Node: Vnodemeta & {v: <P>(props: P) => Vframe};
}>;
export const vnode = D.taggedEnum<Vnode>();


export const shallow = vnode.$match({
    Root: (vn) => vn.v(ShallowProxy.make()),
    Node: (vn) => vn.v(ShallowProxy.make()),
});
