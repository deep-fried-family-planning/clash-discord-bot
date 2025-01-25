import type {HookState, HookStates} from '#disreact/model/hooks/hook-state.ts';
import type {DisReactAbstractNode} from '#disreact/model/nodes/abstract-node.ts';



export const dismountTree = (
  node: DisReactAbstractNode | null | undefined,
  collectedStates: HookState[] = [],
): HookState[] => {
  if (!node) {
    return collectedStates;
  }

  for (const child of node.nodes) {
    dismountTree(child, collectedStates);
  }

  const state = node.dismount();

  if (state) {
    collectedStates.push(state);
  }

  return collectedStates;
};


export const accumulateStates = (
  node: DisReactAbstractNode | null | undefined,
): HookStates => {
  if (!node) return {};

  const result = {} as HookStates;

  if (node.name && node.state !== undefined) {
    result[node.name] = node.state;
  }

  for (const child of node.nodes) {
    Object.assign(result, accumulateStates(child));
  }

  return result;
};
