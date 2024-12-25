import {D} from '#src/internal/pure/effect.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import {ShallowProxy, type Vc, type Ve} from '..';


type Vmessagemeta = {
    name: str;
};


export type Vmessage = D.TaggedEnum<{
    Message: Vmessagemeta & {v: <P>(props: P) => readonly [Ve.Vembed[], Vc.Vcomponent[]]};
    Dialog : Vmessagemeta & {v: <P>(props: P) => readonly [[], Vc.Vcomponent[]]};
}>;
export const vmessage = D.taggedEnum<Vmessage>();


export const shallow = vmessage.$match({
    Message: (vm) => vm.v(ShallowProxy.make()),
    Dialog : (vm) => vm.v(ShallowProxy.make()),
});
