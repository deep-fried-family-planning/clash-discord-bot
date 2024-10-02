import {
    prependAll as concatL,
    filter as filterL,
    flatMap as flatMapL,
    flatten as flattenL,
    map as mapL,
    reduce as reduceL,
    sort as sortL,
    zip as zipL,
    of as ofL,
} from 'effect/Array';
import type {num} from '#src/pure/types-pure.ts';

export {
    concatL,
    mapL,
    flatMapL,
    flattenL,
    filterL,
    reduceL,
    zipL,
    sortL,
    ofL,
};

export const numL = () => [] as num[];
