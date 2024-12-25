import type {Cx} from '#dfdis';
import type {CxMap} from '#discord/utils/types.ts';
import type {str} from '#src/internal/pure/types-pure.ts';


export type I = {
    rx? : Cx.T;
    ax? : Cx.T;
    scp?: Cx.T;
    scn?: Cx.T;
    sxp?: Cx.T;
    sxn?: Cx.T;
    vx? : Cx.T;
};


export type T = {
    [k in str]?: I
};


export const empty = (): T => ({});


export const pure = <A extends T>(s: A) => s;
export const get = <A extends T>(key: str) => (s: A) => s[key];
export const setAll = (kind: keyof I, ts: CxMap) => (s: T) => {
    for (const t in ts) {
        s[t] ??= {};
        s[t][kind] = ts[t];
    }
    return s;
};
