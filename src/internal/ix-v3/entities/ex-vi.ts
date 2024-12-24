import type {ny, str} from '#src/internal/pure/types-pure.ts';
import {NONE} from '#src/internal/ix-v3/entities/constants.ts';


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
    root        : NONE,
    embed_name  : NONE,
    embed_mode  : NONE,
    page_port   : NONE,
    page_static : NONE,
    page_current: NONE,
    row         : NONE,
});


export type VirtualRouter = {
    parse: (id: str) => T;
    build: (vparams: T) => str;
};


export const data = (vparams: T) => {
    return `${vparams.embed_name}/${vparams.embed_mode}`;
};
