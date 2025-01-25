
import type {HookState} from '#disreact/model/hooks/hook-state.ts';
import type {DisReactAbstractNode} from '#disreact/model/nodes/abstract-node.ts';
import {globalValue} from 'effect/GlobalValue';



const todoCurrentFiberId = {};


export const getActiveFiberId = () => todoCurrentFiberId;


export const ActiveNodes = globalValue(
  Symbol.for('DR.ActiveNodes'),
  () => new WeakMap<object, DisReactAbstractNode>(),
);

export const GlobalHooks = globalValue(
  Symbol.for('DisReact.GlobalHooks'),
  () => new WeakMap<DisReactAbstractNode, HookState>(),
);
