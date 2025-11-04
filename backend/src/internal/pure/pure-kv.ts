import {mapL} from '#src/internal/pure/pure-list.ts';
import type {AnyKV} from '#src/internal/pure/types-pure.ts';
import {empty as emptyKV, filter as filterKV, fromEntries, keys as keysKv, map as mapKV, reduce, replace as replaceKV, size as sizeKV, toEntries} from 'effect/Record';
import {flow} from 'effect/Function';

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
