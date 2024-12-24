import type {ny, str} from '#src/internal/pure/types-pure.ts';
import {NONE} from '#src/internal/ix-v3/entities/constants.ts';


export type T = {
    root  : str;
    name  : str;
    data  : str;
    action: str;
    type  : str;
    mode  : str;
    view  : str;
    mod   : str;
    pgp   : str;
    pgn   : str;
    pgx   : str;
    row   : str;
    col   : str;
};


export const empty = (): T => ({
    root  : NONE,
    name  : NONE,
    data  : NONE,
    action: NONE,
    type  : NONE,
    mode  : NONE,
    view  : NONE,
    pgp   : NONE,
    pgn   : NONE,
    pgx   : NONE,
    row   : NONE,
    col   : NONE,
    mod   : NONE,
});


export type VirtualRouter = {
    parse: (id: str) => T;
    build: (vparams: T) => str;
};


export const data = (vparams: T) => {
    if (vparams.name === NONE || vparams.data === NONE) {
        return `${vparams.type}/${vparams.row}/${vparams.col}`;
    }
    return `${vparams.name}/${vparams.data}`;
};

export const action = (vparams: T) => {
    return `${vparams.name}/${vparams.action}`;
};

export const noAction = `${NONE}/${NONE}`;
