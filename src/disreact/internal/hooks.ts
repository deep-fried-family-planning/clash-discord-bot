/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-return */



export type FiberState = {
  id           : string;
  pc           : number;
  stack        : any[];
  sync         : any[];
  async        : any[];
  component?   : any;
  rc           : number;
  interaction ?: any;
};

export const emptyState = (
  id: string,
  component: any,
  interaction: any,
): FiberState => ({
  id,
  pc   : 0,
  stack: [],
  sync : [],
  async: [],
  rc   : 0,
  component,
  interaction,
});



const useState = (fiber: FiberState) => (initial: any) => {
  const current = fiber.stack[fiber.pc++];

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

  return [state.s, setState];
};



const useReducer = (fiber: FiberState) => (reducer: any, initialState: any) => {
  const current = fiber.stack[fiber.pc++];

  if (!current) {
    fiber.stack[fiber.pc] = {s: initialState};
  }

  const state = fiber.stack[fiber.pc];

  const dispatch = (action: any) => {
    state.s = reducer(state.s, action);
  };

  return [state.s, dispatch];
};


// todo
const useEffect = (fiber: FiberState) => (effect: any, deps?: any[]) => {
  const current = fiber.stack[fiber.pc++];

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

  if (fiber.rc === undefined)
    fiber.async.push(effect);
};


// todo
const useLayoutEffect = (fiber: FiberState) => () => {};

export const attachHooks = (fiber: FiberState) => ({
  useState  : useState(fiber),
  useReducer: useReducer(fiber),
  useEffect : useEffect(fiber),
});


// todo
export const encodeHooks = (rec: Record<string, FiberState>): URLSearchParams => {
  const search = new URLSearchParams();
  const states = Object.values(rec);

  for (const state of states) {
    search.set(state.id, encodeURIComponent(JSON.stringify(state)));
  }
  return search;
};


// todo
export const decodeHooks = (search: URLSearchParams): Record<string, FiberState> => {
  const states = {} as Record<string, FiberState>;

  for (const [id, value] of search.entries()) {
    states[id] = JSON.parse(decodeURIComponent(value));
  }
  return states;
};
