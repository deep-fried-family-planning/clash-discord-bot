import type {Hook} from '#src/internal/disreact/entity/index.ts';
import {type Node, Unsafe} from '#src/internal/disreact/entity/index.ts';
import type {num, str} from '#src/internal/pure/types-pure.ts';
import console from 'node:console';


let call_count = 0,
    hooks = [] as Hook.SyncCall[],
    nodes = {} as { [k in str]: Node.DisReactNodeFn };


export const getCount = () => call_count;


export const addHook = <A extends Hook.SyncCall>(hook: A) => {
  hooks[call_count] = hook;
  call_count++;
  return hook;
};


export const getHook = <A extends Hook.SyncCall>(count: num) => {
  if (hooks[count]) return hooks[count] as A;
  return null;
};


export const hydrateHook = <A extends Hook.SyncCall>(hook: A, call: num) => {
  hooks[call] = hook;
};


export const flushHooks = () => {
  console.log(Unsafe.call_get(), 'flushing hooks...');
  const temp = [...hooks];
  hooks = [];
  call_count = 0;
  return temp;
};


export const setNodes = (n: { [k in str]: Node.DisReactNodeFn }) => nodes = n;
export const flushNodes = () => {
  console.log(Unsafe.call_get(), 'flushing nodes...');
  const temp = {...nodes};
  nodes = {};
  return temp;
};
