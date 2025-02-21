import type {NodeHookState} from '#src/disreact/model/HookDispatch.ts';
import type {HookStacksById} from '#src/disreact/model/types.ts';
import {flow} from 'effect';



export const encodeStacks = (rec: HookStacksById): URLSearchParams => {
  const search  = new URLSearchParams();
  const entries = Object.entries(rec);

  for (const [id, stack] of entries) {
    search.set(id, simpleEncode(stack));
  }
  return search;
};



export const decodeStacks = (search: URLSearchParams): HookStacksById => {
  const states = {} as HookStacksById;

  for (const [id, value] of search.entries()) {
    states[id] = simpleDecode(value) as NodeHookState['stack'];
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
