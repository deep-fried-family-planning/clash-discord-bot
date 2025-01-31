/* eslint-disable @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-argument,@typescript-eslint/no-explicit-any */
import {type Events, Tags} from '#src/disreact/enum/index.ts';
import type {HookState, HookStates} from '#src/disreact/model/hook-state.ts';
import {type DisReactNode, FunctionNode} from '#src/disreact/model/node.ts';
import type {rec} from '#src/internal/pure/pure.ts';



export const cloneTree = (node: DisReactNode, root = true): DisReactNode => {
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

export const dismountTree = (node: DisReactNode | null | undefined, states: HookState[] = []): HookState[] => {
  if (!node) {
    return states;
  }
  for (const child of node.nodes) {
    dismountTree(child, states);
  }
  const state = node.dismount();

  if (state) {
    states.push(state);
  }
  return states;
};

export const accumulateStates = (node: DisReactNode | null | undefined): HookStates => {
  if (!node) {
    return {};
  }
  const result = {} as HookStates;

  if (node.name && node.state !== undefined && node.state.stack.length) {
    result[node.name] = node.state;
  }
  for (const child of node.nodes) {
    Object.assign(result, accumulateStates(child));
  }
  return result;
};

export const staticRender = (root: DisReactNode, beforeRender?: (node: DisReactNode) => void, afterRender?: (node: DisReactNode) => void): void => {
  const renderNode = (node: DisReactNode): void => {
    if (beforeRender) {
      beforeRender(node);
    }
    node.mount();
    const next = node.render(node.props);
    node.dismount();

    for (let i = 0; i < node.nodes.length; i++) {
      const child = node.nodes[i];
      child.setParent(node, i);
      renderNode(child);
    }
    if (afterRender) {
      afterRender(next);
    }
  };
  renderNode(root);
};

export const renderTree = (node: DisReactNode, states?: rec<HookState>): DisReactNode => {
  if (states && node.name in states) {
    node.state = states[node.name];
  }
  const rendered = node.render(node.props);
  let resolved   = node;

  if (!areNodesEqual(node, rendered)) {
    node.dismount();
    rendered.mount();

    if (node.isRoot) {
      rendered.setAbsoluteRoot();
    }
    else {
      rendered.setParent(node.parent!, node.index);
    }
    resolved = rendered;
  }
  else {
    node.setProps(rendered.props);
    resolved = node;
  }

  for (let i = 0; i < resolved.nodes.length; i++) {
    const curr = resolved.nodes[i];

    curr.setParent(resolved, i);
    const next = renderTree(curr, states);
    next.setParent(resolved, i);
  }

  return resolved;
};

export const findNode = (rootNode: DisReactNode, predicate: (node: DisReactNode) => boolean): DisReactNode | undefined => {
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

export const mapNodes = (rootNode: DisReactNode, callback: (parent: DisReactNode, child: DisReactNode) => void): void => {
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

export const areNodesEqual = (nodeA: DisReactNode, nodeB: DisReactNode): boolean => {
  if (nodeA.type !== nodeB.type) return false;
  if (nodeA.nodes.length !== nodeB.nodes.length) return false;
  if (nodeA.name !== nodeB.name) return false;
  return arePropsShallowEqual(nodeA.props, nodeB.props);
};

export const arePropsShallowEqual = (objA: any, objB: any): boolean => {
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
    if (key === 'children') {
      continue;
    }
    if (objA[key] !== objB[key]) {
      return false;
    }
  }
  return true;
};

export const findNodeById = (hydrated: DisReactNode, event: Events.Events) => findNode(
  hydrated,
  event._tag === 'DialogSubmit'
    ? (node) => [Tags.dialog, Tags.modal].includes(node.name)
    : (node) => node.props.custom_id
        ? node.props.custom_id === event.id
        : (node.relative_id) === event.id,
);

export type RootMap = { [k in string]: { [k in string]: DisReactNode } };

export const createRootMap = (roots: DisReactNode[], rootMaps: RootMap = {}) => {
  for (const root of roots) {
    if (root.name in rootMaps) {
      throw new Error('Duplicate root name: ' + root.name);
    }
    rootMaps[root.name] = {};

    let latch = 0;

    staticRender(
      root,
      () => {},
      (rendered) => {
        if (latch === 0) {
          latch = 1;
        }
        else {
          recurseRootMap(rendered, root, rootMaps);
        }
      },
    );
  }

  return rootMaps;
};


const recurseRootMap = (rendered: DisReactNode, root: DisReactNode, rootMaps: RootMap): void => {
  if (!rendered.switches) return;

  rendered.setRootMapParent(root);
  rootMaps[root.name][rendered.name] = rendered;

  for (const node in rendered.switches) {
    if (node in rootMaps || node in rootMaps[root.name]) {
      continue;
    }
    const tree = new FunctionNode(rendered.switches[node], {});

    tree.setRootMapParent(root);

    staticRender(
      tree,
      () => {},
      (rendered) => {
        recurseRootMap(rendered, root, rootMaps);
      },
    );

    rootMaps[root.name][node] = tree;
  }
};
