import {Kv, p} from '#src/internal/pure/effect.ts';
import type {str} from '#src/internal/pure/types-pure.ts';
import type {Protocol} from '#src/internal/ix-system/enum/enums.ts';
import type {AnyE, EA} from '#src/internal/types.ts';


export const slicePredicate = (name: str, action: str) => `${name}/${action}`;


export const makeSlice = <
    Spec extends {
        [k in str]: {
            scope     : str;
            // type      : Discord.ComponentType;
            protocols?: [typeof Protocol[keyof typeof Protocol]];
        }
    },
    Init extends AnyE<{[k in keyof Spec]: unknown}>,
    InitReducer extends (sg: unknown, sc: EA<Init>, ax: unknown) => Init,
    Reducers extends {[k in keyof Spec]: (sg: unknown, sc: EA<Init>, ax: unknown) => Init},
    OutReducers extends {[k in 'init' as str]: InitReducer} & {[k in keyof Reducers as str]: Reducers[k]},
    ActionsAlias extends {[k in keyof Reducers as str]: str},
>(
    config: {
        name   : str;
        spec   : Spec;
        init   : InitReducer;
        actions: Reducers;
    },
): {
    name   : str;
    sx     : ActionsAlias;
    ax     : {[k in keyof Reducers]: str};
    actions: OutReducers;
} => {
    return {
        name   : config.name,
        sx     : p(config.spec, Kv.mapEntries((v, k) => [slicePredicate(config.name, v.scope), k])) as ActionsAlias,
        ax     : p(config.spec, Kv.mapEntries((v, k) => [k, slicePredicate(config.name, v.scope)])) as {[k in keyof Reducers]: str},
        actions: p(
            config.spec,
            Kv.mapEntries((v, k) => [slicePredicate(config.name, v.scope), config.actions[k]]),
            Kv.set(slicePredicate(config.name, 'init'), config.init),
        ) as OutReducers,
    };
};
