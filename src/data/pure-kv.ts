import {reduce, toEntries} from 'fp-ts/Record';
import {fromEntries} from 'fp-ts/ReadonlyRecord';
import {flow} from 'fp-ts/function';
import {OrdS} from '#src/data/pure.ts';
import {mapL} from '#src/data/pure-list.ts';
import type {AnyKV} from '#src/data/types-pure.ts';

import {
    map as mapKV,
    filter as filterKV,
    size as sizeKV,
} from 'fp-ts/Record';

export {
    mapKV,
    filterKV,
    sizeKV,
};

export const reduceKV = reduce(OrdS);

export const toValuesKV = flow(toEntries, mapL(([, v]) => v));

export const fromValuesKV = flow(<T extends AnyKV>(id: T[Extract<T[keyof T], string>]) => flow(mapL((v: T) => [v[id], v] as const), fromEntries));
