import type {Hooks, StacksById} from '#src/disreact/internal/types.ts';
import {flow} from 'effect';



export const encodeStacks = (rec: StacksById): URLSearchParams => {
  const search  = new URLSearchParams();
  const entries = Object.entries(rec);

  for (const [id, stack] of entries) {
    search.set(id, simpleEncode(stack));
  }
  return search;
};



export const decodeStacks = (search: URLSearchParams): StacksById => {
  const states = {} as StacksById;

  for (const [id, value] of search.entries()) {
    states[id] = simpleDecode(value) as Hooks['stack'];
  }
  return states;
};



const simpleEncode = flow(
  JSON.stringify,
  encodeURIComponent,
);

const simpleDecode = flow(
  decodeURIComponent,
  JSON.parse,
);
