import {reduce, toEntries} from 'fp-ts/Record';
import {fromEntries} from 'fp-ts/ReadonlyRecord';
import {flow} from 'fp-ts/function';
import {OrdS} from '#src/pure/pure.ts';
import {mapL} from '#src/pure/pure-list.ts';
import type {AnyKV} from '#src/pure/types-pure.ts';

import {
    filter as filterKV,
    map as mapKV,
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
