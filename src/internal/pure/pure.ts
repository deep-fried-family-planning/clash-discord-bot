import type {DispatchedHit} from '#src/internal/graph/pipeline/ingest-types.ts';
import {Order as OrdB} from 'effect/Boolean';
import {Order as OrdN} from 'effect/Number';
import {make as fromCompare} from 'effect/Order';
import {Order as OrdS} from 'effect/String';


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


export {inspect as nodeInspect} from 'node:util';
import {inspect as nodeInspect} from 'node:util';

export const inspectLog = <A>(title: string) => (thing: A) => {
    console.log(title, nodeInspect(thing, false, null));
    return thing;
};
