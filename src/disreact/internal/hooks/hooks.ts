/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-return */
import {CLOSE} from '#src/disreact/abstract/index.ts';
import {HookDispatch} from '#src/disreact/internal/hooks/HookDispatch.ts';
import type {Hooks, RenderFn} from '#src/disreact/internal/dsx/types.ts';



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



const useEffect = (fiber: Hooks) => (effect: any, deps?: any[]) => {
  const current = fiber.stack[fiber.pc];

  if (deps) {
    for (const dep of deps) {
      switch (typeof dep) {
        case 'symbol':
        case 'function':
          throw new Error('Unsupported Dependency Type');
      }
    }
  }

  if (!current) {
    fiber.stack[fiber.pc] = deps ? {d: deps} : {};
  }

  const state = fiber.stack[fiber.pc];

  if (fiber.rc === 0) {
    fiber.async.push(effect);
  }
  else if (deps) {
    if (state.d.length === 0 && deps.length === 0) {
      fiber.async.push(effect);
    }
    else if (state.d?.length !== deps.length) {
      throw new Error('Laws of Hooks Violation');
    }
    else {
      let changed = false;
      for (let i = 0; i < deps.length; i++) {
        if (deps[i] !== state.d[i]) {
          changed = true;
          break;
        }
      }
      if (changed) {
        fiber.async.push(effect);
        state.d = deps;
      }
    }
  }

  fiber.pc++;
};



const useIxData = (_: Hooks) => () => {
  const ctx = HookDispatch.__ctxread();

  return ctx.rest;
};



const usePage = (_: Hooks) => (_: RenderFn[]) => {
  const ctx = HookDispatch.__ctxread();

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
  useIxData : useIxData(fiber),
});
