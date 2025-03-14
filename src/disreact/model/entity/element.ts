import {RestElement} from '#src/disreact/model/entity/rest-element.ts';
import {TaskElement} from '#src/disreact/model/entity/task-element.ts';
import {TextLeaf} from '#src/disreact/model/entity/text-leaf.ts';



export * as Element from './element.ts';
export type Element = Parent;

export type Parent =
  | RestElement
  | TaskElement;

export type Leaf =
  | TextLeaf;

export type Any =
  | Parent
  | Leaf;

export interface Meta {
  id : string;
  idx: string;
}

export const Fragment = undefined;

export const isLeaf = (self: any): self is string =>
  TextLeaf.isType(self);

export const isNode = (self: any): self is Parent =>
  self &&
  typeof self === 'object' && (
    RestElement.isTag(self) ||
    TaskElement.isTag(self)
  );

export const make = (type: any, props: any) => {
  switch (typeof type) {
    case 'undefined': {
      return props.children;
    }

    case 'string': {
      return RestElement.make(type, props);
    }

    case 'function': {
      return TaskElement.make(type, props);
    }

    default: {
      throw new Error(`Invalid Element Type: ${type}`);
    }
  }
};

export const jsx = (type: any, props: any) => {
  const self = make(type, props);
  self.type;
  return self;
};



export const clone = <A extends Any>(self: A): A => {
  if (TextLeaf.is(self)) {
    return TextLeaf.clone(self) as A;
  }
  if (RestElement.isTag(self)) {
    return RestElement.clone(self) as A;
  }
  return TaskElement.clone(self) as A;
};

export const deepClone = <A extends Any>(self: A): A => {
  const cloned = clone(self);

  if (TextLeaf.is(cloned)) {
    return cloned;
  }

  for (let i = 0; i < cloned.children.length; i++) {
    cloned.children[i] = deepClone(cloned.children[i]);
  }

  return cloned;
};

export const isSame = (a: Element.Any, b: Element.Any): boolean => {
  if (a === b) {
    return true;
  }
  if (a._tag !== b._tag) {
    return false;
  }
  if (a.constructor.name !== b.constructor.name) {
    return false;
  }
  if (TextLeaf.is(a)) {
    return a.value === (b as TextLeaf).value;
  }
  return true;
};

export const linearize = (self: Element.Any): void => {
  if (TaskElement.isTag(self)) {
    TaskElement.linearize(self);
  }
};

export const linearizeDeep = (self: Element) => {
  linearize(self);

  for (const child of self.children) {
    linearize(child);
  }

  return self;
};
