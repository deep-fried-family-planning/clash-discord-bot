import type {eobj, str} from '#src/internal/pure/types-pure.ts';
import type {AnyE} from '#src/internal/types.ts';
import type {Cx} from '../entities';
import type {JustC} from '#src/internal/ix-v3/entities/util.ts';
import {Kv, pipe} from '#src/internal/pure/effect.ts';


export type DataSpec = {
    slice: str;
    data : str;
};


export const make = <
    Spec extends {
        [k in str]: {type: typeof Cx.C[Exclude<keyof typeof Cx.C, '$is' | '$match'>]};
    },
    Data extends {
        [k in keyof Spec]: Partial<ReturnType<Spec[k]['type']>>
    },
    Sg extends object,
    Actions extends {
        [k in Exclude<str, 'init'>]: (sg: Sg, sxc: Data) => AnyE<Data>
    },
    OutData extends {
        [k in keyof Spec as str]: {
            slice: str;
            data : str;
            type : Spec[k]['type'];
        }
    },
    OutActions extends {
        [k in 'init' as str]: {
            slice  : str;
            action : str;
            reducer: (sg: Sg, sxc: Data) => AnyE<Data>;
        }
    } & {
        [k in keyof Actions as str]: {
            slice  : str;
            action : str;
            reducer: (sg: Sg, sxc: Data) => AnyE<Data>;
        }
    },
>(
    config: {
        name   : str;
        spec   : Spec;
        init   : (sg: unknown, sxc: Data) => AnyE<Data>;
        actions: Actions;
    },
) => {
    return {
        name: config.name,
        spec: config.spec,
        data: pipe(
            config.spec,
            Kv.mapEntries((v, k) => [k, {
                slice: config.name,
                data : k,
                type : v.type,
            }]),
        ) as OutData,
        actions: pipe(
            config.actions,
            Kv.mapEntries((v, k) => [k, {
                slice  : config.name,
                action : k,
                reducer: v,
            }]),
            Kv.set('init', {
                slice  : config.name,
                action : 'init',
                reducer: config.init,
            }),
        ) as OutActions,
    };
};


export const configure = <
    Spec extends {
        [k in str]: {type: JustC<typeof Cx.C>}
    },
    Data extends {
        [k in keyof Spec]: Partial<Parameters<Spec[k]['type']>[0]>
    },
    Init extends (sxc: Data) => AnyE<Data>,
    Actions extends {
        [k in Exclude<str, 'init'>]: Init
    },
>(
    config: {
        name: str;
        spec: Spec;
        init: Init;
    },
) => config;


export const addActions = <
    Spec extends {
        [k in str]: {type: JustC<typeof Cx.C>}
    },
    Data extends {
        [k in keyof Spec]: Partial<Parameters<Spec[k]['type']>[0]>
    },
    Init extends (sxc: Data) => AnyE<Data>,
    Actions extends {
        [k in Exclude<str, 'init'>]: Init
    },
    OutData extends {
        [k in keyof Spec]: {
            slice: str;
            data : str;
        }
    },
    OutActions extends {
        init: {
            slice  : str;
            action : str;
            reducer: Init;
        };
    } & {
        [k in keyof Actions]: {
            slice  : str;
            action : str;
            reducer: Init;
        }
    },
>(
    actions: Actions,
) => (
    config: {
        name: str;
        spec: Spec;
        init: Init;
    },
) => {
    return {
        name: config.name,
        spec: config.spec,
        data: pipe(config.spec, Kv.mapEntries((_v, k) => [k, {
            slice: config.name,
            data : k,
        }])) as OutData,
        action: pipe(actions, Kv.mapEntries((v, k) => [k, {
            slice  : config.name,
            action : k,
            reducer: v,
        }])) as OutActions,
    };
};


export const sliceThenAction = () => {};
export const sliceAndAction = () => {};


export const sliceThenData = () => {};
export const sliceAndData = () => {};
