import type {DisReactNode} from '#src/disreact/model/node.ts';



export const findNode = (
  rootNode: DisReactNode,
  predicate: (node: DisReactNode) => boolean,
): DisReactNode | undefined => {
  if (predicate(rootNode)) {
    return rootNode;
  }

  for (const childNode of rootNode.nodes) {
    const result = findNode(childNode, predicate);

    if (result) {
      return result;
    }
  }

  return undefined;
};


export const mapNodes = (
  rootNode: DisReactNode,
  callback: (parent: DisReactNode, child: DisReactNode) => void,
): void => {
  for (const childNode of rootNode.nodes) {
    callback(rootNode, childNode);

    mapNodes(childNode, callback);
  }
};
