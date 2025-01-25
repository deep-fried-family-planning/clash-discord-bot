import {Df, type Hk, type Nd} from 'src/internal/disreact/virtual/entities/index.ts';
import {NONE} from 'src/internal/disreact/virtual/kinds/constants.ts';
import type {mut} from 'src/internal/pure/types-pure.ts';



let call_num = 0;

export const call_id = () => call_num++;


let hook_num = 0,
    hooks    = [] as Hk.Sync[];

export const hook_id    = () => hook_num++;
export const resetHooks = () => {
  hook_num = 0;
  hooks    = [];
};
export const registerHook = (hook: typeof hooks[number]) => {
  hooks.push(hook);
};
export const getHooks = () => [...hooks];
export const hydrateHook = (updater: Hk.Update) => {
  (hooks[updater.sync_id] as mut<Hk.Sync>).data = updater.data;
};


let hook_call_num = 0,
    hook_calls    = [] as Hk.Update[];

export const hook_call_id    = () => hook_call_num++;
export const hook_call_reset = () => {
  hook_call_num = 0;
  hook_calls    = [];
};
export const getHookUpdaters = () => [...hook_calls];
export const resetHookCalls  = () => hook_calls = [];


let nodes     = {} as Nd.KeyedFns,
    next_node = NONE,
    close = false,
    defer = Df.None;

export const getNodes      = () => nodes;
export const setNodes      = (next: typeof nodes) => nodes = next;
export const resetNodes    = () => nodes = {};
export const getNextNode   = () => next_node;
export const setNextNode   = (next: typeof next_node) => next_node = next;
export const resetNextNode = () => next_node = NONE;
export const getClose      = () => close;
export const setClose      = (next: typeof close) => close = next;
export const resetClose    = () => close = false;
export const setDefer      = (next: typeof defer) => defer = next;
export const getDefer      = () => defer;
export const resetDefer    = () => defer = Df.None;
