import type {Cx} from '#src/internal/ix-v2/model/entities/cx.ts';
import {f, Kv, p} from '#src/internal/pure/effect.ts';
import type {str} from '#src/internal/pure/types-pure';


type Cxs = Record<string, Cx>;


export const pure = <T extends Cxs>(cxs: T) => cxs;

export const map = <T extends Cxs, V>(fa: (k: str, v: Cx) => readonly [str, V]) => f(
    pure<T>,
    Kv.mapEntries((v, k) => fa(k, v)),
);

