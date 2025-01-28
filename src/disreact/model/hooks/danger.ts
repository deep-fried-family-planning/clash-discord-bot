
import type {TagFunc} from '#src/disreact/model/dsx/types.ts';
import {getActiveRenderNode, type HookState} from '#src/disreact/model/hooks/hook-state.ts';
import type {DisReactNode} from '#src/disreact/model/node.ts';
import type {rec} from '#src/internal/pure/pure.ts';
import {globalValue} from 'effect/GlobalValue';



const todoCurrentFiberId = {};


export const getActiveFiberId = () => todoCurrentFiberId;


export const ActiveNodes = globalValue(
  Symbol.for('DR.ActiveNodes'),
  () => new WeakMap<object, DisReactNode>(),
);

export const GlobalHooks = globalValue(
  Symbol.for('DisReact.GlobalHooks'),
  () => new WeakMap<DisReactNode, HookState>(),
);


export type Switches = { [k in string]: TagFunc };


let current: string        = '',
    possible: rec<TagFunc> = {};


export const useSwitch = (views: rec<TagFunc> | TagFunc[]) => {
  if (!Array.isArray(views)) {
    possible = views;
  }
  else {
    possible = {};
    for (const view of views) {
      possible[view.name] = view;
    }
  }

  const activeNode = getActiveRenderNode();

  if (activeNode) {
    activeNode.switches ??= {...possible};
  }

  return (next: string | TagFunc): void => {
    if (current === next) return;

    const resolved = typeof next === 'function' ? next.name : next;

    if (!activeNode) throw new Error('No active node');
    if (!activeNode.switches) throw new Error('No switches');
    if (!(resolved in activeNode.switches)) throw new Error(`Invalid view: ${resolved}`);

    current = resolved;
  };
};



export const setSwitch = (view: string): void => {
  current = view;
};

export const resetSwitch = (): void => {
  current = '';
};

export const getSwitch = () => current;

export const getSwitches = () => possible;
