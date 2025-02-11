/* eslint-disable @typescript-eslint/no-explicit-any */
import {NONE_STR} from '#src/disreact/abstract/index.ts';
import {attachHooks, emptyHooks} from '#src/disreact/internal/index.ts';
import type {GlobalContext, Hooks} from '#src/disreact/internal/types.ts';
import {E, L} from '#src/internal/pure/effect.ts';
import {globalValue} from 'effect/GlobalValue';



export type MainHookState = {
  next    : string;
  handler?: Promise<void> | E.Effect<void>;
};

const emptyMainHookState = (): MainHookState => ({
  next: NONE_STR,
});



export type NodeHookState = {
  pc   : number;
  stack: any[];
  queue: any[];
  rc   : number;
};

const emptyNodeHookState = (): NodeHookState => ({
  pc   : 0,
  stack: [],
  queue: [],
  rc   : 0,
});



const nullptr  = Symbol('DisReact.nullptr');
const ptr      = {current: null as unknown as symbol};
const dispatch = {current: null as null | ReturnType<typeof attachHooks>};
const main     = globalValue(Symbol.for('DisReact.main'), () => new WeakMap<symbol, GlobalContext>());
const node     = globalValue(Symbol.for('DisReact.node'), () => new WeakMap<symbol, Map<string, Hooks>>());



const __mallocnull = () => {
  ptr.current = nullptr;
  main.set(nullptr, HookDispatch.emptyMainHookState());
  node.set(nullptr, new Map());
};

const __malloc = (id: string) => {
  const pointer = Symbol(`DisReact.${id}`);
  node.set(pointer, new Map());
  ptr.current = pointer;
  return pointer;
};

const __free = () => {
  node.delete(ptr.current);
  ptr.current = nullptr;
};

const __acquire = (symbol: symbol) => {
  ptr.current = symbol;
  return ptr.current;
};

const __release = () => {
  ptr.current = nullptr;
};

const __ctxwrite = (ctx: GlobalContext) => {
  main.set(ptr.current, ctx);
  return ctx;
};

const __ctxread = () => {
  const ctx = main.get(ptr.current);
  if (!ctx) {
    throw new Error('Unregistered interaction');
  }
  return ctx;
};

const __prep = (id: string, state?: Hooks) => {
  const states = node.get(ptr.current);

  if (!states) {
    throw new Error('Unregistered interaction');
  }

  if (!state) {
    const next = emptyHooks(id);
    states.set(id, next);
    dispatch.current = attachHooks(next);
    return next;
  }
  else {
    states.set(id, state);
    dispatch.current = attachHooks(state);
    return state;
  }
};

const __get = (id: string) => {
  dispatch.current = null;
  const states     = node.get(ptr.current);
  if (!states) {
    throw new Error('Unregistered interaction');
  }
  const state = states.get(id);
  if (!state) {
    throw new Error(`No state found: ${id}`);
  }
  return state;
};

const __mount = (id: string) => {
  const states = node.get(ptr.current);
  if (!states) {
    throw new Error('Unregistered interaction');
  }
  return states.set(id, emptyHooks(id));
};

const __dismount = (id: string) => {
  dispatch.current = null;
  const states     = node.get(ptr.current);
  if (!states) {
    throw new Error('Unregistered interaction');
  }
  return states.delete(id);
};

const __hooks = () => {
  if (!dispatch.current) {
    throw new Error('Hooks cannot be called from outside the render function.');
  }
  return dispatch.current;
};



const make = (id: symbol) => E.sync(() => {
  return {};
});



export class HookDispatch extends E.Tag('DisReact.HookDispatch')<
  HookDispatch,
  E.Effect.Success<ReturnType<typeof make>>
>() {
  static makeLayer = (id: symbol) => L.effect(this, make(id));

  static emptyMainHookState = emptyMainHookState;
  static emptyNodeHookState = emptyNodeHookState;

  static __mallocnull = __mallocnull;
  static __malloc     = __malloc;
  static __free       = __free;
  static __acquire    = __acquire;
  static __release    = __release;
  static __ctxwrite   = __ctxwrite;
  static __ctxread    = __ctxread;
  static __prep       = __prep;
  static __get        = __get;
  static __mount      = __mount;
  static __dismount   = __dismount;
  static __hooks      = __hooks;
}
