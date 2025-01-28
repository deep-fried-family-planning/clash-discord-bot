import type { Rest, Rest} from '#src/disreact/api/index.ts';
import {Defer} from '#src/disreact/api/index.ts';
import type {TagFunc} from '#src/disreact/model/dsx/types.ts';
import {getActiveRenderNode, type HookState} from '#src/disreact/model/hooks/hook-state.ts';
import type {DisReactNode} from '#src/disreact/model/node.ts';
import type {rec} from '#src/internal/pure/pure.ts';
import {globalValue} from 'effect/GlobalValue';



export const CLOSE_SWITCH = 'CLOSE_SWITCH';

export type Switches = { [k in string]: TagFunc };

export type GlobalRef = {
  rest   : {[k in string]: object};
  props  : {[k in string]: object};
  discord: {
    user   : Rest.User;
    guild  : Rest.Guild;
    channel: Rest.Channel;
    member : Rest.GuildMember;
  };
};


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

export const GlobalPages = globalValue(
  Symbol.for('DisReact.GlobalSwitches'),
  () => new WeakMap<DisReactNode, string>(),
);

export const GlobalDefers = globalValue(
  Symbol.for('DisReact.GlobalDefers'),
  () => new WeakMap<DisReactNode, Defer.Defer>(),
);

export const GlobalRefs = globalValue(
  Symbol.for('DisReact.GlobalRefs'),
  () => new WeakMap<DisReactNode, GlobalRef>(),
);



export const usePage = (views: rec<TagFunc> | TagFunc[]) => {
  let possible = {} as Switches;

  if (!Array.isArray(views)) possible = views;
  else for (const view of views) possible[view.name] = view;

  const node = getActiveRenderNode();

  if (node) {
    node.switches ??= {...possible};
    GlobalPages.set(node, node.name);
  }

  return (next: string | TagFunc | false | Defer.Close): void => {
    if (!node || !node.switches) throw new Error('No node or switches');

    if (next === false) {
      GlobalPages.set(node, CLOSE_SWITCH);
      return;
    }

    const resolved = typeof next === 'function' ? next.name
      : Defer.isClose(next) ? CLOSE_SWITCH
      : next;

    if (!(resolved in node.switches)) {
      throw new Error(`Invalid view: ${resolved}`);
    }

    GlobalPages.set(node, resolved);
  };
};



export const useDefer = () => {
  const node = getActiveRenderNode();

  return (next: Defer.Defer): void => {
    if (!node) throw new Error('No active node');
    if (Defer.isNone(next)) throw new Error('Invalid defer');
    GlobalDefers.set(node, next);
  };
};
