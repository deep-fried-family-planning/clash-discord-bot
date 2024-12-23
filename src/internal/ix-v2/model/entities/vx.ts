import {Ar, D, p} from '#src/internal/pure/effect.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import type {Ex, Cx} from '../system';


export type Enum = D.TaggedEnum<{
    Modal : {name: str; view: (si, sx, ax) => (Ex.Ex | Cx.Cx[])[]};
    Single: {name: str; view: (si, sx, ax) => (Ex.Ex | Cx.Cx[])[]};
}>;


export const Enum = D.taggedEnum<Enum>();


export const getEx = (vx: (Ex.Ex | Cx.Cx[])[]) => p(
    vx,
    Ar.filter((v) => !Ar.isArray(v)),
) as unknown as Ex.Ex[];


export const getCx = (vx: (Ex.Ex | Cx.Cx[])[]) => p(
    vx,
    Ar.filter(Ar.isArray),
) as unknown as Cx.Cx[][];
