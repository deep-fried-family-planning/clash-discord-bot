/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type {HookStates} from '#src/disreact/model/hooks/hook-state.ts';



export const encodeHooks = (rec: HookStates): URLSearchParams => {
  const params = new URLSearchParams();
  const states = Object.values(rec);

  for (const state of states) {
    params.set(state.id, encodeURIComponent(JSON.stringify(state)));
  }

  return params;
};


export const decodeHooks = (params: URLSearchParams): HookStates => {
  const states = {} as HookStates;

  for (const [id, value] of params.entries()) {
    states[id] = JSON.parse(decodeURIComponent(value));
  }

  return states;
};
