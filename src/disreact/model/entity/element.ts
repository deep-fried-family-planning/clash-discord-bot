import {RestElement} from '#src/disreact/model/entity/element-rest.ts';
import {TaskElem} from '#src/disreact/model/entity/element-task.ts';
import {LeafElem} from '#src/disreact/model/entity/leaf.ts';
import type {FiberNode} from '#src/disreact/model/hooks/fiber-node.ts';
import {FC} from './fc.ts';



export * as Elem from './element.ts';
export type Elem<P = any, A = any> =
  | RestElement
  | TaskElem
  | LeafElem;

export const Fragment = undefined;

export const isSame = (a: Elem, b: Elem): boolean => {
  if (a === b) {
    return true;
  }
  if (a._tag !== b._tag) {
    return false;
  }
  if (a.constructor.name !== b.constructor.name) {
    return false;
  }
  if (LeafElem.is(a)) {
    return a.value === (b as LeafElem).value;
  }
  return true;
};

export const make = (type: any, props: any) => {
  switch (typeof type) {
    case 'undefined': {
      return props.children;
    }

    case 'string': {
      return RestElement.make(type, props);
    }

    case 'function': {
      return TaskElem.make(type, props);
    }

    default: {
      throw new Error(`Invalid Element Type: ${type}`);
    }
  }
};

export const clone = <A extends Elem>(self: A): A => {
  if (LeafElem.is(self)) {
    return LeafElem.clone(self) as A;
  }
  if (RestElement.isTag(self)) {
    return RestElement.clone(self) as A;
  }
  return TaskElem.clone(self) as A;
};

export const deepClone = <A extends Elem>(self: A): A => {
  const cloned = clone(self);

  if (!LeafElem.is(cloned)) {
    for (let i = 0; i < cloned.children.length; i++) {
      cloned.children[i] = deepClone(cloned.children[i]);
    }
  }

  return cloned;
};

export const linearize = <A extends Elem>(self: A): A => {
  if (LeafElem.is(self)) {
    return self;
  }

  if (TaskElem.isTag(self)) {
    delete self.fiber.root;
    delete self.fiber.element;
  }

  for (let i = 0; i < self.children.length; i++) {
    linearize(self.children[i]);
  }

  return self;
};

export interface Meta {
  id     : string;
  idx    : string;
  step_id: string;
}

export const linkNodeToParent = <T extends Elem>(node: T, parent?: Elem): T => {
  if (!parent) {
    node.idx = 0;

    if (TaskElem.isTag(node)) {

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

export const setIds = (children: Elem[], parent: Elem) => {
  for (let i = 0; i < children.length; i++) {
    const child = children[i];

    if (LeafElem.is(child)) {
      continue;
    }
    if (RestElement.isTag(child)) {
      child.idx = `${child.type}:${i}`;
    }
    if (TaskElem.isTag(child)) {
      child.idx = `${FC.getName(child.type)}:${i}`;
    }
    child.step_id = `${(parent as TaskElem).idx}:${child.idx}`;
    child.id      = `${(parent as TaskElem).id}:${child.idx}`;
  }
  return children;
};

export const collectStates = (node: Elem, states: { [K in string]: FiberNode } = {}): typeof states => {
  if (TaskElem.isTag(node)) {
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
