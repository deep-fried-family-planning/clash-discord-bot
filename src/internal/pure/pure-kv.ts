import {mapL} from '#src/internal/pure/pure-list.ts';
import type {AnyKV} from '#src/internal/pure/types-pure.ts';
import {
    reduce, toEntries, fromEntries,
    filter as filterKV,
    map as mapKV,
    size as sizeKV,
    empty as emptyKV,
    keys as keysKv,
    replace as replaceKV,
} from 'effect/Record';
import {flow} from '#src/internal/pure/effect.ts';

export {
    mapKV,
    filterKV,
    sizeKV,
    emptyKV,
    keysKv,
    replaceKV,
};

export const reduceKV = reduce;

export const toValuesKV = flow(toEntries, mapL(([, v]) => v));

export const fromValuesKV = flow(<T extends AnyKV>(id: T[Extract<T[keyof T], string>]) => flow(mapL((v: T) => [v[id], v] as const), fromEntries));
