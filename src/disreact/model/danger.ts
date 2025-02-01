import {PAGE} from '#src/disreact/enum/index.ts';
import type {TagFunc} from '#src/disreact/model/types.ts';
import {getActiveRenderNode, type HookState} from '#src/disreact/model/hook-state.ts';
import type {DisReactNode} from '#src/disreact/model/node.ts';
import {CriticalFailure} from '#src/disreact/runtime/service.ts';
import type {rec} from '#src/internal/pure/pure.ts';
import {globalValue} from 'effect/GlobalValue';



export const CLOSE_SWITCH = 'CLOSE_SWITCH';

export type Switches = { [k in string]: TagFunc };

const todoCurrentFiberId = {};

export const getActiveFiberId = () => todoCurrentFiberId;

export const ActiveNodes = globalValue(Symbol.for('DisReact.ActiveNodes'), () => new WeakMap<object, DisReactNode>());
export const GlobalHooks = globalValue(Symbol.for('DisReact.GlobalHooks'), () => new WeakMap<DisReactNode, HookState>());
export const GlobalPages = globalValue(Symbol.for('DisReact.GlobalPages'), () => new WeakMap<DisReactNode, string>());

export const usePage = (views: rec<TagFunc> | TagFunc[]) => {
  let possible = {} as Switches;

  if (!Array.isArray(views)) possible = views;
  else for (const view of views) possible[view.name] = view;

  const node = getActiveRenderNode();

  if (node) {
    node.switches ??= {...possible};
    GlobalPages.set(node, node.name);
  }

  return (next: string | TagFunc | false): void => {
    if (!node || !node.switches) {
      throw new CriticalFailure({why: 'No node or switches'});
    }
    if (next === false || next === PAGE.CLOSE) {
      GlobalPages.set(node, PAGE.CLOSE);
      return;
    }
    const resolved = typeof next === 'function'
      ? next.name
      : next;

    if (!(resolved in node.switches)) {
      throw new CriticalFailure({why: `Invalid view: ${resolved}`});
    }
    GlobalPages.set(node, resolved);
  };
};
