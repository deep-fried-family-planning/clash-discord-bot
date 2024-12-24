import type {ny, str} from '#src/internal/pure/types-pure.ts';
import {NONE} from '#src/internal/ix-v3/entities/constants.ts';


export type VirtualParams = {
    root          : str;
    sc_name       : str;
    sc_data       : str;
    sc_action     : str;
    component_name: str;
    component_mode: str;
    view_name     : str;
    view_type     : str;
    page_port     : str;
    page_static   : str;
    page_current  : str;
    row           : str;
    col           : str;
};


export const empty = (): VirtualParams => ({
    root          : NONE,
    sc_name       : NONE,
    sc_data       : NONE,
    sc_action     : NONE,
    component_name: NONE,
    component_mode: NONE,
    view_name     : NONE,
    view_type     : NONE,
    page_port     : NONE,
    page_static   : NONE,
    page_current  : NONE,
    row           : NONE,
    col           : NONE,
});


export type T = {
    parse: (id: str) => VirtualParams;
    build: (vparams: VirtualParams) => str;
};


export const data = (vparams: VirtualParams) => {
    if (vparams.sc_name === NONE || vparams.sc_data === NONE) {
        return `${vparams.component_name}/${vparams.row}/${vparams.col}`;
    }
    return `${vparams.sc_name}/${vparams.sc_data}`;
};

export const action = (vparams: VirtualParams) => {
    return `${vparams.sc_name}/${vparams.sc_action}`;
};

export const noAction = `${NONE}/${NONE}`;
