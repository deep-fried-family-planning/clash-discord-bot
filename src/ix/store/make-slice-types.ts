/* eslint-disable @typescript-eslint/no-explicit-any */

import type {num, str} from '#src/internal/pure/types-pure.ts';
import type {E} from '#src/internal/pure/effect.ts';
import type {Sx} from '#src/ix/store/types.ts';


export type ScK = readonly str[];


export type ScConfig<
    K extends ScK,
> = {
    readonly slice: str;
    readonly alias: {
        readonly [k in K[num]]: unknown
    };
};


export type Sc<
    K extends ScK,
> = {
    readonly [k in K[num]]: unknown
};


export type ScInit<
    K extends ScK,
    S extends Sc<K>,
> = (sx: Sx, sc: Sc<readonly str[]>) => E.Effect<S, any, any>;


export type ScAction<
    K extends ScK,
    S extends Sc<K>,
> = {
    readonly [k in K[num]]: (sx: Sx, sc: S) => E.Effect<S, any, any>
};
