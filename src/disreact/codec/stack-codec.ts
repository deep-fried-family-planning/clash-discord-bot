import {flow} from 'effect';
import type {NodeState} from './entities';



export const encodeStacks = (rec: { [K in string]: NodeState.Type['stack'] }): URLSearchParams => {
  const search  = new URLSearchParams();
  const entries = Object.entries(rec);

  for (const [id, stack] of entries) {
    search.set(id, simpleEncode(stack));
  }
  return search;
};



export const decodeStacks = (search: URLSearchParams): { [K in string]: NodeState.Type['stack'] } => {
  const states = {} as { [K in string]: NodeState.Type['stack'] };

  for (const [id, value] of search.entries()) {
    states[id] = simpleDecode(value) as NodeState.Type['stack'];
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
