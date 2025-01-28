/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-assignment */


import {ActiveNodes, getActiveFiberId, GlobalHooks} from '#src/disreact/model/hooks/danger.ts';
import type {DisReactNode} from '#src/disreact/model/node.ts';



export type HookStates = Record<string, HookState>;

export type HookState = {
  id   : string;
  pc   : number;
  stack: any[]; // sync calls
  queue: any[]; // update/effect calls
};

export const emptyHookState = () => {
  return {
    id   : '-',
    pc   : 0,
    stack: [],
    queue: [],
  };
};

export const mountNode = (node: DisReactNode) => {
  const state = node.state ?? emptyHookState();

  GlobalHooks.set(node, state);

  return state;
};

export const dismountNode = (node: DisReactNode) => {
  const current = GlobalHooks.get(node);

  GlobalHooks.delete(node);

  if (current) {
    current.pc = 0;
  }

  return current;
};

export const setActiveRenderNode = (node: DisReactNode): void => {
  const fiberId = getActiveFiberId();

  node.state!.pc = 0;

  ActiveNodes.set(fiberId, node);
};


export const releaseActiveRenderNode = () => {
  const fiberId = getActiveFiberId();

  ActiveNodes.delete(fiberId);
};


export const getActiveRenderNode = () => {
  return ActiveNodes.get(getActiveFiberId());
};


export const getHookState = () => {
  const node = getActiveRenderNode();
  if (!node) {
    return emptyHookState();
  }
  const state = GlobalHooks.get(node);
  if (!state) {
    return emptyHookState();
  }
  return state;
};


export const encodeHooks = (rec: HookStates): URLSearchParams => {
  const search = new URLSearchParams();
  const states = Object.values(rec);

  for (const state of states) {
    search.set(state.id, encodeURIComponent(JSON.stringify(state)));
  }

  return search;
};


export const decodeHooks = (search: URLSearchParams): HookStates => {
  const states = {} as HookStates;

  for (const [id, value] of search.entries()) {
    states[id] = JSON.parse(decodeURIComponent(value));
  }

  return states;
};
