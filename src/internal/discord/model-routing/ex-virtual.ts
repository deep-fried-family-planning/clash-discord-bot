import {Const} from '#dfdis';
import type {str} from '#src/internal/pure/types-pure.ts';


export type T = {
    root        : str;
    embed_name  : str;
    embed_mode  : str;
    page_port   : str;
    page_static : str;
    page_current: str;
    row         : str;
};


export const empty = (): T => ({
    root        : Const.NONE,
    embed_name  : Const.NONE,
    embed_mode  : Const.NONE,
    page_port   : Const.NONE,
    page_static : Const.NONE,
    page_current: Const.NONE,
    row         : Const.NONE,
});


export type VirtualRouter = {
    parse: (id: str) => T;
    build: (vparams: T) => str;
};


export const data = (vparams: T) => {
    return `${vparams.embed_name}/${vparams.embed_mode}`;
};
