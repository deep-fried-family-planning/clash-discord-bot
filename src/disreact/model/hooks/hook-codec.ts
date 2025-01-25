/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import type {HookState} from '#disreact/model/hooks/hook-state.ts';
import type {rec} from '#src/internal/pure/types-pure.ts';



export const encodeHooks = (rec: rec<HookState>): URLSearchParams => {
  const params = new URLSearchParams();
  const states = Object.values(rec);

  for (const state of states) {
    params.set(state.id, encodeURIComponent(JSON.stringify(state)));
  }

  return params;
};


export const decodeHooks = (params: URLSearchParams): rec<HookState> => {
  const states = {} as rec<HookState>;

  for (const [id, value] of params.entries()) {
    states[id] = JSON.parse(decodeURIComponent(value));
  }

  return states;
};
