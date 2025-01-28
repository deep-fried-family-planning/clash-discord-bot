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


export const findNearestFunctionParent = (node: DisReactNode): DisReactNode | null => {
  let currentNode = node.parent;

  while (currentNode) {
    if (typeof currentNode.type === 'function') {
      return currentNode;
    }
    currentNode = currentNode.parent;
  }

  return null;
};
