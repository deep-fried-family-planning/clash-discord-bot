/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-return */
import {CLOSE} from '#src/disreact/abstract/index.ts';
import {__ctxread} from '#src/disreact/internal/index.ts';
import type {Hooks, PragmaFunction, RenderFn, HookStacksById} from '#src/disreact/internal/types.ts';



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



const usePage = (_: Hooks) => (_: RenderFn[]) => {
  const ctx = __ctxread();

  return {
    next: (next: RenderFn) => {
      ctx.next = next.name;
    },
    close: () => {
      ctx.next = CLOSE;
    },
  };
};



export const attachHooks = (fiber: Hooks) => ({
  useState  : useState(fiber),
  useReducer: useReducer(fiber),
  useEffect : useEffect(fiber),
  usePage   : usePage(fiber),
});
