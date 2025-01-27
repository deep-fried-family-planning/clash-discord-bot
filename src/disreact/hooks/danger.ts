
import type {HookState} from '#src/disreact/model/hooks/hook-state.ts';
import type {DisReactNode} from '#src/disreact/model/tree/node.ts';
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
