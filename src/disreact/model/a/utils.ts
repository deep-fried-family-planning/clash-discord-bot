import type {FiberNode} from '#src/disreact/model/hooks/fiber-node.ts';
import type {Element} from '#src/disreact/model/entity/element';
import { TaskElement } from '../entity/task-element';
import { TextLeaf } from '../entity/text-leaf';



export const linkNodeToParent = <T extends Element>(node: T, parent?: Element): T => {
  if (!parent) {
    node.idx     = 0;

    if (TaskElement.isTag(node)) {

    }

    node.step_id = `${node.id}:${node.idx}`;
    node.full_id = `${node.id}:${node.idx}`;
  }
  else {
    node.step_id = `${parent.id}:${parent.idx}:${node.id}:${node.idx}`;
    node.full_id = `${parent.full_id}:${node.id}:${node.idx}`;
  }
  return node;
};

export const setIds = (children: Element.Any[], parent: Element) => {
  for (let i = 0; i < children.length; i++) {
    const child = children[i];

    if (TextLeaf.is(child)) {
      continue;
    }
    child.idx      = `${child.idx}:${i}`;
    child.id       = `${parent.id}:${child.idx}`;
  }
  return children;
};

export const collectStates = (node: Element.Any, states: { [K in string]: FiberNode } = {}): typeof states => {
  if (TaskElement.isTag(node)) {
    states[node.id] = node.fiber;
  }

  if ('children' in node && Array.isArray(node.children)) {
    for (const child of node.children) {
      collectStates(child, states);
    }
  }

  return states;
};

export const reduceToStacks = (hooks: { [K in string]: FiberNode }): { [K in string]: FiberNode['stack'] } => {
  return Object.fromEntries(
    Object.entries(hooks)
      .filter(([_, value]) => value.stack.length)
      .map(([key, value]) => [key, value.stack]),
  );
};
