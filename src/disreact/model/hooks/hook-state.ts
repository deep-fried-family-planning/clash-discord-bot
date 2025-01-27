/* eslint-disable @typescript-eslint/no-explicit-any */


import {ActiveNodes, getActiveFiberId, GlobalHooks} from '#src/disreact/model/hooks/danger.ts';
import type {DisReactNode} from '#src/disreact/model/tree/node.ts';



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
