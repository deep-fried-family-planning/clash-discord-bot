import type {HookState, HookStates} from '#src/disreact/model/hooks/hook-state.ts';
import {areNodesEqual, arePropsShallowEqual, type DisReactNode} from '#src/disreact/model/node.ts';
import type {rec} from '#src/internal/pure/pure.ts';



export const cloneTree = (
  node: DisReactNode,
  root = true,
): DisReactNode => {
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


export const mountTree = (node: DisReactNode | null | undefined): void => {
  if (!node) {
    return;
  }

  node.mount();

  for (const child of node.nodes) {
    mountTree(child);
  }
};


export const dismountTree = (
  node: DisReactNode | null | undefined,
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
  node: DisReactNode | null | undefined,
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


export const staticRender = (
  root: DisReactNode,
  beforeRender?: (node: DisReactNode) => void,
  afterRender?: (node: DisReactNode) => void,
): void => {
  const renderNode = (node: DisReactNode): void => {
    if (beforeRender) beforeRender(node);

    node.mount();

    const next = node.render(node.props);

    node.dismount();

    for (let i = 0; i < node.nodes.length; i++) {
      const child = node.nodes[i];
      child.setParent(node, i);
      renderNode(child);
    }

    if (afterRender) afterRender(next);
  };

  renderNode(root);
};


export const renderTree = (node: DisReactNode, states?: rec<HookState>): DisReactNode => {
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
