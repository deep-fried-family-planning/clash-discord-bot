import type {DisReactAbstractNode} from '#disreact/model/nodes/abstract-node.ts';



export const cloneTree = (node: DisReactAbstractNode, root = true): DisReactAbstractNode => {
  const clonedNode = node.clone();

  clonedNode.mount();

  if (root) {
    clonedNode.setAbsoluteRoot();
  }

  for (let i = 0; i < node.nodes.length; i++) {
    const childNode       = node.nodes[i];
    const clonedChildNode = cloneTree(childNode, false);

    clonedChildNode.setParent(clonedNode, i);
    clonedNode.nodes.push(clonedChildNode);
  }

  return clonedNode;
};
