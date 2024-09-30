import {
    concat as concatL,
    filterWithIndex as filterIdxL,
    filter as filterL,
    flatMap as flatMapL,
    flatten as flattenL,
    mapWithIndex as mapIdxL,
    map as mapL,
    reduceWithIndex as reduceIdxL,
    reduce as reduceL,
    sort as sortL,
    zip as zipL,
} from 'fp-ts/Array';
import type {num} from '#src/data/types-pure.ts';

export {
    concatL,
    mapL,
    mapIdxL,
    flatMapL,
    flattenL,
    filterL,
    filterIdxL,
    reduceL,
    reduceIdxL,
    zipL,
    sortL,
};

export const numL = () => [] as num[];
