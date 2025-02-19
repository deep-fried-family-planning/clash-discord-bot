import type { Rest } from '#src/disreact/codec/abstract/index.ts';
import {NONE_STR} from '#src/disreact/codec/abstract/index.ts';
import type {GlobalContext, Hooks} from '#src/disreact/dsx/types.ts';
import {attachHooks, emptyHooks} from '#src/disreact/hooks/hooks.ts';
import {E, L} from '#src/internal/pure/effect.ts';
import {globalValue} from 'effect/GlobalValue';
import console from 'node:console';



export type MainHookState = {
  next     : string;
  nextProps: any;
  handler? : Promise<void> | E.Effect<void>;
  rest     : Rest.Interaction;
  store?: {
    id          : string;
    initialState: any;
    reducer     : any;
    stack       : any[];
    queue       : any[];
  };
};

const emptyMainHookState = (): MainHookState => ({
  next     : NONE_STR,
  nextProps: {},
  rest     : null as unknown as Rest.Interaction,
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



const nullptr = Symbol('DisReact.nullptr');
const ptr = {current: null as unknown as symbol};
const dispatch = {current: null as null | ReturnType<typeof attachHooks>};
const main = globalValue(Symbol.for('DisReact.main'), () => new WeakMap<symbol, MainHookState>());
const node = globalValue(Symbol.for('DisReact.node'), () => new WeakMap<symbol, Map<string, Hooks>>());



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

const __ctxwrite = (ctx: MainHookState) => {
  main.set(ptr.current, ctx);
  return ctx;
};

const __ctxread = () => {
  const ctx = main.get(ptr.current);
  console.log('__ctxread', ctx);
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
  const states = node.get(ptr.current);
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
  const states = node.get(ptr.current);
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
  static readonly makeLayer = (id: symbol) => L.effect(this, make(id));

  static readonly emptyMainHookState = emptyMainHookState;
  static readonly emptyNodeHookState = emptyNodeHookState;
  static readonly __mallocnull = __mallocnull;
  static readonly __malloc = __malloc;
  static readonly __free = __free;
  static readonly __acquire = __acquire;
  static readonly __release = __release;
  static readonly __ctxwrite = __ctxwrite;
  static readonly __ctxread = __ctxread;
  static readonly __prep = __prep;
  static readonly __get = __get;
  static readonly __mount = __mount;
  static readonly __dismount = __dismount;
  static readonly __hooks = __hooks;
}
