/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-member-access */
import type {DisReactAbstractNode} from '#disreact/model/nodes/abstract-node.ts';



export const findNodeByProp = (
  node: DisReactAbstractNode | null | undefined,
  propName: string,
  value: any,
): DisReactAbstractNode | null => {
  if (!node) {
    return null;
  }

  if (node.props && node.props[propName] === value) {
    return node;
  }

  for (const child of node.nodes) {
    const foundNode = findNodeByProp(child, propName, value);
    if (foundNode) {
      return foundNode;
    }
  }

  return null;
};



export const findNodeByType = (
  node: DisReactAbstractNode | null | undefined,
  type: string,
): DisReactAbstractNode | null => {
  if (!node) {
    return null;
  }

  if (node.type === type) {
    return node;
  }

  for (const child of node.nodes) {
    const foundNode = findNodeByType(child, type);
    if (foundNode) {
      return foundNode;
    }
  }

  return null;
};
