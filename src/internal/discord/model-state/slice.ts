import type {Cx} from '#dfdis';
import {Kv, pipe} from '#src/internal/pure/effect.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import type {AnyE} from '#src/internal/types.ts';


export type DataSpec = {
    slice: str;
    data : str;
};


export const make = <
    Sg extends {ope: ''},
    Spec extends {[k in str]: {type: Cx.T['_tag']}},
    Data extends {[k in keyof Spec]: Cx.E[Spec[k]['type']]},
    Reducers extends
    & {[k in 'init']: (sg: Sg, sxc: Data) => AnyE<Data>}
    & {[k in str]: (sg: Sg, sxc: Data) => AnyE<Data>},
    OutData extends {[k in keyof Spec]: {slice: str; data: k; type: Spec[k]['type']}},
    OutActions extends {[k in keyof Reducers]: {slice: str; action: k}},
>(
    config: {
        name   : str;
        spec   : Spec;
        actions: Reducers;
    },
) => {
    return {
        name    : config.name,
        data    : pipe(config.spec, Kv.mapEntries((v, k) => [k, {slice: config.name, data: k, type: v.type}])) as unknown as OutData,
        ax      : pipe(config.actions, Kv.mapEntries((_, k) => [k, {slice: config.name, action: k}])) as unknown as OutActions,
        reducers: config.actions as {[k in str]: (sg: unknown, sxc: unknown) => AnyE<Data>},
    };
};
