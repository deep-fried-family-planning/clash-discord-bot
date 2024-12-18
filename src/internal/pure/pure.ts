import {Order as OrdN} from 'effect/Number';
import {Order as OrdS} from 'effect/String';
import {Order as OrdB} from 'effect/Boolean';
import {make as fromCompare} from 'effect/Order';
import type {DispatchedHit} from '#src/internal/graph/pipeline/ingest-types.ts';

export {
    OrdN,
    OrdS,
    OrdB,
    fromCompare,
};

export const orderHits = fromCompare<DispatchedHit>((h1, h2) => OrdN(h1.order, h2.order));


export * as MD from '#src/internal/pure/markdown.ts'; // discord flavored markdown


export type Encode<T> = (t: unknown) => T;
export type Decode<T> = (t: unknown) => T;
