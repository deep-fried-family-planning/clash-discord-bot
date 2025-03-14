import type { Elem } from '#src/disreact/model/element/element';
import {RestElement} from '#src/disreact/model/element/rest.ts';
import {TaskElem} from '#src/disreact/model/element/task.ts';
import {LeafElem} from '#src/disreact/model/element/leaf.ts';



export const cloneElement = (self: Elem): Elem => {
  if (LeafElem.is(self)) {
    return LeafElem.clone(self);
  }

  if (RestElement.is(self)) {
    return RestElement.clone(self);
  }

  return TaskElem.clone(self);
};

export const cloneTree = (self: Elem, parent?: Elem): Elem => {
  const linked = linkParent(self, parent);
  const cloned = cloneElement(linked);

  if (cloned.children.length) {
    cloned.children = cloned.children.map((child) => cloneTree(child, cloned));
  }

  return cloned;
};



export const linkParent = <A extends Elem>(node: A, parent?: Elem): A => {
  if (!parent) {
    node.idx     = 0;
    node.id      = `${node.id}:${node.idx}`;
    node.step_id = `${node.id}:${node.idx}`;
    node.full_id = `${node.id}:${node.idx}`;
  }
  else {
    node.id      = `${node.id}:${node.idx}`;
    node.step_id = `${parent.id}:${node.id}`;
    node.full_id = `${parent.full_id}:${node.id}`;
  }
  return node;
};
