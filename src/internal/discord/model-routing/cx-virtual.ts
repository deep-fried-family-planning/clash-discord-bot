import {Const} from '#discord/index.ts';
import type {str} from '#src/internal/pure/types-pure.ts';


export type T = {
    root     : str;
    view     : str;
    accessor?: str;
    dialog?  : str;
    row      : str;
    col      : str;
    name?    : str;
    data?    : str;
    action?  : str;
    type?    : str;
    mode?    : str;
    p_group? : str;
    p_num?   : str;
    p_now?   : str;
    mod?     : str;
};


export const empty = (): T => ({
    root: Const.NONE,
    view: Const.NONE,
    row : Const.NONE,
    col : Const.NONE,
});


export type VirtualRouter = {
    parse: (id: str) => T;
    build: (vparams: T) => str;
};


export const makeAccessor       = (name: str, data: str) => `${name}/${data}`;
export const makeAccessorFromVR = (vparams: T) => {
    if (vparams.name === Const.NONE || vparams.data === Const.NONE) {
        return `${vparams.type}/${vparams.row}/${vparams.col}`;
    }
    return `${vparams.name}/${vparams.data}`;
};


export const makeAction  = (name: str, action: str) => `${name}/${action}`;
export const emptyData   = () => `${Const.NONE}/${Const.NONE}`;
export const emptyAction = () => `${Const.NONE}/${Const.NONE}`;


export const vAction = (vparams: T) => `${vparams.name}/${vparams.action}`;
