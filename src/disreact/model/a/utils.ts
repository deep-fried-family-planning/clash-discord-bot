import * as All from '#src/disreact/codec/constants/all.ts';
import type * as Element from '#src/disreact/codec/element/index.ts';
import type * as FiberNode from '#src/disreact/model/entity/fiber/fiber-node.ts';
import * as Lifecycles from '#src/disreact/lifecycles/index.ts';



export const linkNodeToParent = <T extends Element.Element>(node: T, parent?: Element.Element): T => {
  if (!parent) {
    node.meta.idx     = 0;
    node.meta.id      = `${node._name}:${node.meta.idx}`;
    node.meta.step_id = `${node._name}:${node.meta.idx}`;
    node.meta.full_id = `${node._name}:${node.meta.idx}`;
  }
  else {
    node.meta.id      = `${node._name}:${node.meta.idx}`;
    node.meta.step_id = `${parent.meta.id}:${node.meta.id}`;
    node.meta.full_id = `${parent.meta.full_id}:${node.meta.id}`;
  }
  return node;
};

export const setIds = (children: Element.Element[], parent: Element.Element) => {
  for (let i = 0; i < children.length; i++) {
    children[i].meta.idx = i;
    children[i].meta.id  = `${parent._name}:${i}`;
    children[i]          = Lifecycles.linkNodeToParent(children[i], parent);
  }
  return children;
};

export const collectStates = (node: Element.Element, states: { [K in string]: FiberNode.FiberNode } = {}): typeof states => {
  if (node._tag === All.FunctionElementTag) {
    states[node.meta.full_id] = node.state;
  }

  if ('children' in node && Array.isArray(node.children)) {
    for (const child of node.children) {
      collectStates(child, states);
    }
  }

  return states;
};

export const reduceToStacks = (hooks: { [K in string]: FiberNode.FiberNode }): { [K in string]: FiberNode.FiberNode['stack'] } => {
  return Object.fromEntries(
    Object.entries(hooks)
      .filter(([_, value]) => value.stack.length)
      .map(([key, value]) => [key, value.stack]),
  );
};
