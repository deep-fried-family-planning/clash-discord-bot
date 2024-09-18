import {
    concat as concatL,
    map as mapL,
    mapWithIndex as mapIdxL,
    flatMap as flatMapL,
    flatten as flattenL,
    filter as filterL,
    filterWithIndex as filterIdxL,
    reduce as reduceL,
    reduceWithIndex as reduceIdxL,
    zip as zipL,
    sort as sortL,
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
