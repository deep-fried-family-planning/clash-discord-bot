import {RestElement} from '#src/disreact/model/element/rest.ts';
import {TaskElem} from '#src/disreact/model/element/task.ts';
import {LeafElem} from '#src/disreact/model/element/leaf.ts';
import type {FiberNode} from '#src/disreact/model/entity/fiber-node.ts';
import {FC} from '#src/disreact/model/entity/fc.ts';



export * as Elem from './element.ts';
export type Elem<P = any, A = any> =
  | RestElement
  | TaskElem
  | LeafElem;

export const Fragment = undefined;

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
  if (RestElement.is(self)) {
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

  if (TaskElem.is(self)) {
    delete self.fiber.root;
    delete self.fiber.element;
  }

  for (let i = 0; i < self.children.length; i++) {
    linearize(self.children[i]);
  }

  return self;
};

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

export interface Meta {
  id     : string;
  idx    : string;
  step_id: string;
}

export const setIds = (children: Elem[], parent: Elem) => {
  for (let i = 0; i < children.length; i++) {
    const child = children[i];

    if (LeafElem.is(child)) {
      continue;
    }
    if (RestElement.is(child)) {
      child.idx = `${child.type}:${i}`;
    }
    if (TaskElem.is(child)) {
      child.idx = `${FC.getName(child.type)}:${i}`;
    }
    child.step_id = `${(parent as TaskElem).idx}:${child.idx}`;
    child.id      = `${(parent as TaskElem).id}:${child.idx}`;
  }
  return children;
};

export const collectStates = (node: Elem, states: { [K in string]: FiberNode } = {}): typeof states => {
  if (TaskElem.is(node)) {
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
