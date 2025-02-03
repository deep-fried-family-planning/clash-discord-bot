import {attachHooks, emptyState, type FiberState} from '#src/disreact/internal/hooks.ts';
import {GlobalValue as GV} from 'effect';



export type InteractionSymbol = symbol;
export const makeInteractionSymbol = (id: string): InteractionSymbol => Symbol(id);



export const __nullpointer = makeInteractionSymbol('DisReact.nullpointer');

export const __pointer = {current: null as unknown as InteractionSymbol};

export const setNullPointer = () => {__pointer.current = __nullpointer};

export const setPointer = (pointer: InteractionSymbol) => {__pointer.current = pointer};



export const __interaction = GV.globalValue(Symbol.for('DisReact.ixstate'), () => new WeakMap<InteractionSymbol, {next: string}>());

export const makeNullInteractionState = () => {__interaction.set(__nullpointer, {next: ''})};

export const makeInteractionState = (pointer: InteractionSymbol) => {__interaction.set(pointer, {next: ''})};



export const __hooks = GV.globalValue(Symbol.for('DisReact.state'), () => new WeakMap<InteractionSymbol, Map<string, FiberState>>());

export const makeNullHookStates = () => {__hooks.set(__nullpointer, new Map())};

export const makeHookStates = (pointer: InteractionSymbol) => {__hooks.set(pointer, new Map())};

export const getHookState = (id_full: string) => {
  const states = __hooks.get(__pointer.current);

  if (!states) {
    throw new Error('Unregistered interaction');
  }
  if (states.has(id_full)) {
    return states.get(id_full)!;
  }
  states.set(id_full, {});

  return states.get(id_full)!;
};

export const setHookState = (id_full: string, state?: FiberState) => {
  if (!state) {
    const next = emptyState(id_full);
    __hooks.get(__pointer.current)!.set(id_full, next);
    return next;
  }
  else {
    __hooks.get(__pointer.current)!.set(id_full, state);
    return state;
  }
};



export const __dispatcher = {current: null as null | ReturnType<typeof attachHooks>};

export const getDispatcher = () => {
  if (!__dispatcher.current) {
    throw new Error('Hooks cannot be called from outside the render function.');
  }
  return __dispatcher.current;
};

export const setDispatcher = (state: FiberState) => {
  __dispatcher.current = attachHooks(state);
};

export const resetDispatcher = () => {__dispatcher.current = null};
