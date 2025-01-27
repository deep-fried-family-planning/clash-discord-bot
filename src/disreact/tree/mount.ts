import type {DisReactNode} from '#src/disreact/model/tree/node.ts';



export const mountTree = (node: DisReactNode | null | undefined): void => {
  if (!node) {
    return;
  }

  node.mount();

  for (const child of node.nodes) {
    mountTree(child);
  }
};
