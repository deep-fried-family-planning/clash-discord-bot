import {flow} from '#src/internal/pure/effect.ts';
import {mapL} from '#src/internal/pure/pure-list.ts';
import {empty as emptyKV, filter as filterKV, fromEntries, keys as keysKv, map as mapKV, reduce, replace as replaceKV, size as sizeKV, toEntries} from 'effect/Record';

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
