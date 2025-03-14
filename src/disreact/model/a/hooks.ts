import {CLOSE} from '#src/disreact/codec/constants/common.ts';
import type * as FC from '#src/disreact/model/entity/component/fc.ts';
import type * as FiberNode from '#src/disreact/model/entity/fiber/fiber-node.ts';
import * as Globals from '#src/disreact/lifecycles/globals.ts';



const useState = (fiber: FiberNode.FiberNode) => (initial: any) => {
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



const useReducer = (fiber: FiberNode.FiberNode) => (reducer: any, initialState: any) => {
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



const useEffect = (fiber: FiberNode.FiberNode) => (effect: any, deps?: any[]) => {
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
  const root = Globals.readRoot();

  return root.request;
};



const usePage = () => (_: FC.FC[]) => {
  const root = Globals.readRoot();

  return {
    next: (next: FC.FC, props: any = {}) => {
      root.next.id    = next.name;
      root.next.props = props;
    },
    close: () => {
      root.next.id = CLOSE;
    },
  };
};



export const attachHooks = (fiber: FiberNode.FiberNode) => ({
  useState  : useState(fiber),
  useReducer: useReducer(fiber),
  useEffect : useEffect(fiber),
  usePage   : usePage(),
  useIx     : useIx(),
});
