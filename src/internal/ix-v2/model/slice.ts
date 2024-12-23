import {Kv, p} from '#src/internal/pure/effect.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import type {AnyE} from '#src/internal/types.ts';
import {Cx} from '#src/internal/ix-v2/model/system.ts';


export const predicate = (name: str, action: str) => `${name}/${action}`;


export const make = <
    Spec extends {
        [k in str]: {
            alias: str;
            type : typeof Cx.Cx[Exclude<keyof typeof Cx.Cx, '$is' | '$match'>];
        }
    },
    SpecResolved extends {
        [k in keyof Spec]: Partial<ReturnType<Spec[k]['type']>>
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
    OutSpec extends {
        [k in 'init']: {
            slice: str;
            name : str;
            alias: str;
            type : typeof Cx.Cx[Exclude<keyof typeof Cx.Cx, '$is' | '$match'>];
        };
    } & {
        [k in keyof Spec]: Spec[k] & {
            slice: str;
            name : str;
        }
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
            Kv.mapEntries((v, k) => [k, {
                ...v,
                name : k,
                slice: config.name,
            }]),
            Kv.set('init', {slice: config.name, alias: 'init', name: 'init', type: Cx.Cx.None}),
        ) as OutSpec,
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
                    type   : Cx.Cx.None,
                    name   : 'init',
                    slice  : config.name,
                    reducer: config.init,
                },
            ),
        ),
    };
};


