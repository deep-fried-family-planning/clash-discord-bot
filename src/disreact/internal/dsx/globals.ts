import {attachHooks, emptyHooks} from '#src/disreact/internal/dsx/hooks.ts';
import type {Hooks, IxCtx, IxId} from '#src/disreact/internal/types.ts';
import {GlobalValue as GV} from 'effect';



export const __null     = Symbol('DisReact.__null');
export const __ptr      = {current: null as unknown as IxId};
export const __dispatch = {current: null as null | ReturnType<typeof attachHooks>};
export const __state    = GV.globalValue(Symbol.for('DisReact.__state'), () => new WeakMap<IxId, Map<string, Hooks>>());
export const __ix       = GV.globalValue(Symbol.for('DisReact.__ix'), () => new WeakMap<IxId, IxCtx>());



export const __mallocnull = () => {
  console.debug('[__mallocnull]');
  __state.set(__null, new Map());
  __ptr.current = __null;
};

export const __malloc = (id: string) => {
  console.debug('[__malloc]', id);
  const pointer = Symbol(`DisReact.${id}`);
  __state.set(pointer, new Map());
  __ptr.current = pointer;
  return pointer;
};

export const __free = () => {
  console.debug('[__free]');
  __state.delete(__ptr.current);
  __ptr.current = __null;
};

export const __pointto = (symbol: symbol) => {
  __ptr.current = symbol;
};



export const __prep = (id: string, state?: Hooks) => {
  console.debug('[__prep]', id);
  const states = __state.get(__ptr.current);

  if (!states) {
    throw new Error('Unregistered interaction');
  }

  if (!state) {
    console.debug('[__prep]: no state', id);
    const next = emptyHooks(id);
    states.set(id, next);
    __dispatch.current = attachHooks(next);
    return next;
  }
  else {
    console.debug('[__prep]: state found', state);
    states.set(id, state);
    __dispatch.current = attachHooks(state);
    return state;
  }
};

export const __get = (id: string) => {
  console.debug('[__get]', id);
  __dispatch.current = null;
  const states       = __state.get(__ptr.current);
  if (!states) {
    throw new Error('Unregistered interaction');
  }
  const state = states.get(id);
  if (!state) {
    throw new Error(`No state found: ${id}`);
  }
  console.debug('[__get]', id, state);
  return state;
};

export const __mount = (id: string) => {
  console.debug('[__mount]', id);
  const states = __state.get(__ptr.current);
  if (!states) {
    throw new Error('Unregistered interaction');
  }
  return states.set(id, emptyHooks(id));
};

export const __dismount = (id: string) => {
  console.debug('[dismount]', id);
  __dispatch.current = null;
  const states       = __state.get(__ptr.current);
  if (!states) {
    throw new Error('Unregistered interaction');
  }
  return states.delete(id);
};

export const __hooks = () => {
  console.debug('[__hooks]');
  if (!__dispatch.current) {
    throw new Error('Hooks cannot be called from outside the render function.');
  }
  return __dispatch.current;
};
