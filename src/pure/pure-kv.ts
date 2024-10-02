import {mapL} from '#src/pure/pure-list.ts';
import type {AnyKV} from '#src/pure/types-pure.ts';
import {
    reduce, toEntries, fromEntries,
    filter as filterKV,
    map as mapKV,
    size as sizeKV,
} from 'effect/Record';
import {flow} from '#src/utils/effect.ts';

export {
    mapKV,
    filterKV,
    sizeKV,
};

export const reduceKV = reduce;

export const toValuesKV = flow(toEntries, mapL(([, v]) => v));

export const fromValuesKV = flow(<T extends AnyKV>(id: T[Extract<T[keyof T], string>]) => flow(mapL((v: T) => [v[id], v] as const), fromEntries));
