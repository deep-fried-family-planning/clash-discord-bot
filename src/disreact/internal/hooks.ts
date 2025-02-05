/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-return */
import type {Hooks, PragmaFunction, RenderFn} from '#src/disreact/internal/types.ts';



export const emptyHooks = (
  id: string,
): Hooks => ({
  id,
  pc      : 0,
  stack   : [],
  sync    : [],
  async   : [],
  rc      : 0,
  nextpage: null as null | string,
});



const useState = (fiber: Hooks) => (initial: any) => {
  const current = fiber.stack[fiber.pc];

  if (!current) {
    fiber.stack[fiber.pc] = {s: initial};
  }

  const state = fiber.stack[fiber.pc];

  const setState = (next: any) => {
    if (typeof next === 'function') {
      state.s = next(state.s);
    }
    else {
      state.s = next;
    }
  };

  fiber.pc++;

  return [state.s, setState];
};



const useReducer = (fiber: Hooks) => (reducer: any, initialState: any) => {
  const current = fiber.stack[fiber.pc];

  if (!current) {
    fiber.stack[fiber.pc] = {s: initialState};
  }

  const state = fiber.stack[fiber.pc];

  const dispatch = (action: any) => {
    state.s = reducer(state.s, action);
  };

  fiber.pc++;

  return [state.s, dispatch];
};


// todo
const useEffect = (fiber: Hooks) => (effect: any, deps?: any[]) => {
  const current = fiber.stack[fiber.pc];

  if (deps)
    for (const dep of deps) {
      switch (typeof dep) {
        case 'symbol':
        case 'function':
          throw new Error('Unsupported Dependency Type');
      }
    }

  if (!current)
    fiber.stack[fiber.pc] = deps ? {d: deps} : {};

  const state = fiber.stack[fiber.pc];

  if (fiber.rc === undefined) {
    fiber.async.push(effect);
  }


  fiber.pc++;
};


// todo
const useLayoutEffect = (fiber: Hooks) => () => {};


const useDoken = (fiber: Hooks) => () => {

};


const usePage = (fiber: Hooks) => (fns: RenderFn[]) => {
  return {
    next: (next: PragmaFunction) => {
      fiber.nextpage = next.name;
    },
    close: () => {
      fiber.nextpage = null;
    },
  };
};



export const attachHooks = (fiber: Hooks) => ({
  useState  : useState(fiber),
  useReducer: useReducer(fiber),
  useEffect : useEffect(fiber),
  usePage   : usePage(fiber),
});


// todo
export const encodeHooks = (rec: Record<string, Hooks>): URLSearchParams => {
  const search = new URLSearchParams();
  const states = Object.values(rec);

  for (const state of states) {
    search.set(state.id, encodeURIComponent(JSON.stringify(state)));
  }
  return search;
};


// todo
export const decodeHooks = (search: URLSearchParams): Record<string, Hooks> => {
  const states = {} as Record<string, Hooks>;

  for (const [id, value] of search.entries()) {
    states[id] = JSON.parse(decodeURIComponent(value));
  }
  return states;
};
