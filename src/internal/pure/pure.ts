import type {DispatchedHit} from '#src/internal/graph/pipeline/ingest-types.ts';
import {Order as OrdB} from 'effect/Boolean';
import {Order as OrdN} from 'effect/Number';
import {make as fromCompare} from 'effect/Order';
import {Order as OrdS} from 'effect/String';
import {inspect} from 'node:util';

export type rec<A> = {[k in string]: A};

export {
  OrdN,
  OrdS,
  OrdB,
  fromCompare,
};

export const orderHits = fromCompare<DispatchedHit>((h1, h2) => OrdN(h1.order, h2.order));


export * as MD from '#src/internal/pure/markdown.ts'; // discord flavored markdown

export {inspect};

export const inspectLog = <A>(title: string) => (x: A): A => {
  console.log(title, inspect(x, false, null, true));
  return x;
};

export const inspectLogWith = <A>(title: string, x: A): A => {
  console.log(title, inspect(x, false, null, true));
  return x;
};

export const inspectDirect = <A>(x: A): A => {
  console.log(inspect(x, false, null, true));
  return x;
};
