import {getActiveRenderNode, type HookState} from '#src/disreact/model/hook-state.ts';
import type {NodeTree} from '#src/disreact/model/lifecycle/node.ts';
import type {DisReactNode} from '#src/disreact/model/node.ts';
import {Critical} from '#src/disreact/runtime/service/debug.ts';
import type {rec} from '#src/internal/pure/pure.ts';
import {globalValue} from 'effect/GlobalValue';


const todoCurrentFiberId = {};

export const getActiveFiberId = () => todoCurrentFiberId;

export const ActiveNodes = globalValue(
  Symbol.for('DisReact.ActiveNodes'),
  () => new WeakMap<object, NodeTree>(),
);

export const GlobalHooks = globalValue(
  Symbol.for('DisReact.GlobalHooks'),
  () => new WeakMap<NodeTree, HookState>(),
);

export const GlobalPages = globalValue(
  Symbol.for('DisReact.GlobalPages'),
  () => new WeakMap<NodeTree, string>(),
);

// export const usePage = (views: rec<TagFunc> | TagFunc[]) => {
//   let possible = {} as Switches;
//
//   if (!Array.isArray(views)) possible = views;
//   else for (const view of views) possible[view.name] = view;
//
//   const node = getActiveRenderNode();
//
//   if (node) {
//     node.switches ??= {...possible};
//     GlobalPages.set(node, node.name);
//   }
//
//   return (next: string | TagFunc | false): void => {
//     if (!node || !node.switches) {
//       throw new Critical({why: 'No node or switches'});
//     }
//     if (next === false) {
//       GlobalPages.set(node, CLOSE_SWITCH);
//       return;
//     }
//     const resolved = typeof next === 'function'
//       ? next.name
//       : next;
//
//     if (!(resolved in node.switches)) {
//       throw new Critical({why: `Invalid view: ${resolved}`});
//     }
//     GlobalPages.set(node, resolved);
//   };
// };
