/* eslint-disable @typescript-eslint/no-explicit-any,@typescript-eslint/no-unsafe-argument,@typescript-eslint/no-unsafe-member-access */
import type {HookState} from '#disreact/model/hooks/hook-state.ts';
import type {DisReactAbstractNode} from '#disreact/model/nodes/abstract-node.ts';
import type {rec} from '#src/internal/pure/types-pure.ts';



export const renderTree = (node: DisReactAbstractNode, states?: rec<HookState>): DisReactAbstractNode => {
  if (states && node.name in states) {
    node.state = states[node.name];
  }
  const renderedNode = node.render(node.props);

  if (!arePropsShallowEqual(node.props, renderedNode.props)) {
    node.dismount();
    renderedNode.mount();
  }
  else {
    node.setProps(renderedNode.props);
  }

  for (let i = 0; i < renderedNode.nodes.length; i++) {
    const newChild     = renderedNode.nodes[i];
    const currentChild = node.nodes[i];

    if (areNodesEqual(currentChild, newChild)) {
      currentChild.setProps(newChild.props);
      renderedNode.nodes[i] = renderTree(currentChild);
    }
    else {
      renderedNode.nodes[i] = renderTree(newChild);
      renderedNode.nodes[i].setParent(renderedNode, i);
    }
  }

  if (node.parent) {
    renderedNode.setParent(node.parent, node.index);
  }

  return renderedNode;
};


const areNodesEqual = (nodeA: DisReactAbstractNode, nodeB: DisReactAbstractNode): boolean => {
  if (nodeA === nodeB) return true;
  if (nodeA.key !== nodeB.key) return false;
  if (nodeA.type !== nodeB.type) return false;

  return arePropsShallowEqual(nodeA.props, nodeB.props);
};


const arePropsShallowEqual = (objA: any, objB: any): boolean => {
  if (objA === objB) return true;
  if (typeof objA !== typeof objB) return false;
  if (objA === null || objB === null) return false;
  if (typeof objA !== 'object' || typeof objB !== 'object') return false;

  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);

  if (keysA.length !== keysB.length) {
    return false;
  }

  for (const key of keysA) {
    if (key === 'children') continue;
    if (objA[key] !== objB[key]) {
      return false;
    }
  }

  return true;
};
