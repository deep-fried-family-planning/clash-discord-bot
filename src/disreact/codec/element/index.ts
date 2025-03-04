export * as Children from './children.ts';
export * as Function from './function-element.ts';
export * as Text from './text-element.ts';
export * as Intrinsic from './intrinsic-element.ts';
export * as Props from './props.ts';
export * as Fragment from './fragment.ts';
import type {Pragma} from '#src/disreact/model/lifecycle.ts';
import * as FunctionElement from './function-element.ts';
import * as IntrinsicElement from './intrinsic-element.ts';
import * as TextElement from './text-element.ts';



export type T =
  | FunctionElement.T
  | IntrinsicElement.T
  | TextElement.T;



export const isSame = <A extends T, B extends T>(a: A, b: B): boolean => {
  if (a._tag !== b._tag) {
    return false;
  }

  if (a._name !== b._name) {
    return false;
  }

  if (a.meta.id !== b.meta.id) {
    return false;
  }

  if (TextElement.is(a)) {
    return a.value === (b as TextElement.T).value;
  }

  return true;
};



export const cloneElement = (self: T): T => {
  if (TextElement.is(self)) {
    return TextElement.clone(self);
  }

  if (IntrinsicElement.is(self)) {
    return IntrinsicElement.clone(self);
  }

  return FunctionElement.clone(self);
};

export const cloneTree = (self: T, parent?: T): T => {
  const linked = linkParent(self, parent);
  const cloned = cloneElement(linked);

  if (cloned.children.length) {
    cloned.children = cloned.children.map((child) => cloneTree(child, cloned));
  }

  return cloned;
};



export const linkParent = <T extends Pragma>(node: T, parent?: Pragma): T => {
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



export const encode = (self: T) => {
  if (TextElement.is(self)) {
    return TextElement.encode(self);
  }

  if (IntrinsicElement.is(self)) {
    return IntrinsicElement.encode(self);
  }

  return FunctionElement.encode(self);
};
