import {Order as OrdN} from 'effect/Number';
import {Order as OrdS} from 'effect/String';
import {Order as OrdB} from 'effect/Boolean';
import {make as fromCompare} from 'effect/Order';
import type {DispatchedHit} from '#src/data/pipeline/ingest-types.ts';

export {
    OrdN,
    OrdS,
    OrdB,
    fromCompare,
};

export const orderHits = fromCompare<DispatchedHit>((h1, h2) => OrdN(h1.order, h2.order));
