import {Ord, Ord as OrdN} from 'fp-ts/number';
import {Ord as OrdS} from 'fp-ts/string';
import {fromCompare} from 'fp-ts/Ord';
import type {DispatchedHit} from '#src/data/pipeline/ingest-types.ts';

export {
    OrdN,
    OrdS,
};

export const orderHits = fromCompare<DispatchedHit>((h1, h2) => Ord.compare(h1.order, h2.order));
