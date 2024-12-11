import {E, Kv, p, pipe} from '#src/internal/pure/effect.ts';
import {g} from '#src/internal/pure/effect.ts';
import {Current} from '#src/ix/enum/enums.ts';
import type {Sc, ScAction, ScConfig, ScInit, ScK} from '#src/ix/store/make-slice-types.ts';


export const makeSliceConfig = <
    K extends ScK,
    C extends ScConfig<K>,
>(
    config: C,
) => config;


export const makeSliceInit = <
    K extends ScK,
    C extends ScConfig<K>,
    S extends Sc<K>,
    I extends ScInit<K, S>,
>(
    activate: I,
) => (
    config: C,
) => ({
    activate,
    config,
} as const);


export const makeSlice = <
    K extends ScK,
    C extends ScConfig<K>,
    S extends Sc<K>,
    A extends ScAction<K, S>,
    I extends ScInit<K, S>,
>(
    actions: A,
) => (
    input: {
        activate: I;
        config  : C;
    },
) => {
    return {
        initialize: input.activate,
        slice     : input.config.slice,
        actions   : p(
            actions,
            Kv.mapKeys((k) => `${input.config.slice}/${k}`),
        ),
    } as const;
};


const things = pipe(
    makeSliceConfig({
        slice: Current.ROSTER,
        alias: {
            accounts    : 'a',
            availability: 'av',
        },
    }),
    makeSliceInit((sx, sc) => g(function * () {
        return {
            ...sc,
            accounts: {
                options: [],
                values : [],
            },
            availability: {
                options: [],
                values : [],
            },
        };
    })),
    makeSlice({
        accounts: (sx, sc) => g(function * () {
            return sc;
        }),
        a: (sx, sc) => E.succeed(sc),
    }),
);
