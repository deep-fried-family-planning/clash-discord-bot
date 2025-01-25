import type {DisReactAbstractNode} from '#disreact/model/nodes/abstract-node.ts';



export const mountTree = (node: DisReactAbstractNode | null | undefined): void => {
  if (!node) {
    return;
  }

  node.mount();

  for (const child of node.nodes) {
    mountTree(child);
  }
};
