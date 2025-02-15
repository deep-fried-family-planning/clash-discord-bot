
import type {Hooks} from '#src/disreact/internal/dsx/types.ts';



export const _useReducer = (fiber: Hooks) => (reducer: any, initialState: any) => {
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



export const _useState = (fiber: Hooks) => (initial: any) => {
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
