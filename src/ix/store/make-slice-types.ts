import type {num, str} from '#src/internal/pure/types-pure.ts';


export type ScK = readonly str[];


export type Sc<
    K extends ScK,
> = {
    readonly [k in K[num]]: unknown
};
