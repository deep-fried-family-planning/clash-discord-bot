import {CLOSE} from '#src/disreact/codec/rest/index.ts';
import {HookDispatch} from '#src/disreact/model/hooks/HookDispatch.ts';
import type {RenderFn} from '#src/disreact/model/lifecycle.ts';
import type {NodeState} from '#src/disreact/codec/entities/index.ts';



const useState = (fiber: NodeState.Type) => (initial: any) => {
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



const useReducer = (fiber: NodeState.Type) => (reducer: any, initialState: any) => {
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



const useEffect = (fiber: NodeState.Type) => (effect: any, deps?: any[]) => {
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
    fiber.queue.push(effect);
  }
  else if (deps) {
    if (state.d.length === 0 && deps.length === 0) {
      fiber.queue.push(effect);
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
        fiber.queue.push(effect);
        state.d = deps;
      }
    }
  }

  fiber.pc++;
};



const useIx = () => () => {
  const root = HookDispatch.__ctxread();

  return root.rest;
};



const usePage = () => (_: RenderFn[]) => {
  const root = HookDispatch.__ctxread();

  return {
    next: (next: RenderFn, props: any = {}) => {
      root.graph.next      = next.name;
      root.graph.nextProps = props;
    },
    close: () => {
      root.graph.next = CLOSE;
    },
  };
};



export const attachHooks = (fiber: NodeState.Type) => ({
  useState  : useState(fiber),
  useReducer: useReducer(fiber),
  useEffect : useEffect(fiber),
  usePage   : usePage(),
  useIx     : useIx(),
});
