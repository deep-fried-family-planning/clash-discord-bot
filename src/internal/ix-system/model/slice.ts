import {Kv, p, pipe} from '#src/internal/pure/effect.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import type {AnyE} from '#src/internal/types.ts';
import type {RestResolved, RestType} from '#src/internal/ix-system/model/types.ts';
import type {Protocol} from '#src/internal/ix-system/model/system.ts';


export const predicate = (name: str, action: str) => `${name}/${action}`;


export const make = <
    Spec extends {
        [k in str]: {
            alias    : str;
            type     : RestType;
            protocol?: keyof typeof Protocol.standard.name;
        }
    },
    SpecResolved extends {
        [k in keyof Spec]: RestResolved<Spec[k]['type']>
    },
    InitReducer extends (
        sg: unknown,
        sc: SpecResolved,
        ax: unknown
    ) => AnyE<SpecResolved>,
    Reducers extends {
        [k in keyof Spec]: (
            sg: unknown,
            sc: SpecResolved,
            ax: SpecResolved[k]
        ) => AnyE<SpecResolved>
    },
    OutReducers extends {
        [k in 'init' as str]: InitReducer
    } & {
        [k in keyof Reducers as str]: Reducers[k]
    },
    OutAlias extends {
        [k in 'init']: {slice: str; alias: str; name: str};
    } & {
        [k in keyof Spec]: {slice: str; alias: str; name: str}
    },
>(
    config: {
        name   : str;
        spec   : Spec;
        init   : InitReducer;
        actions: Reducers;
    },
) => {
    return {
        name: config.name,
        spec: p(
            config.spec,
            Kv.mapEntries((v, k) => [k, {...v, name: k}]),
        ),
        alias: p(
            config.spec,
            Kv.toEntries,
            Kv.fromEntries,
            Kv.mapEntries((v, k) => [k, {slice: config.name, name: k, alias: v.alias}]),
            Kv.set('init', {slice: config.name, alias: 'init', name: 'init'}),
        ) as OutAlias,
        actions: p(
            config.spec,
            Kv.toEntries,
            Kv.fromEntries,
            Kv.mapEntries((v, k) => [predicate(config.name, v.alias), config.actions[k]]),
            Kv.set(predicate(config.name, 'init'), config.init),
        ) as OutReducers,

        kv: p(
            config.spec,
            Kv.toEntries,
            Kv.fromEntries,
            Kv.mapEntries((v, k) => [
                predicate(config.name, k),
                {
                    ...v,
                    name   : k,
                    slice  : config.name,
                    reducer: config.actions[k],
                },
            ]),
            Kv.set(
                predicate(config.name, 'init'),
                {
                    alias  : '0',
                    type   : '',
                    name   : 'init',
                    slice  : config.name,
                    reducer: config.init,
                },
            ),
        ),
    };
};
