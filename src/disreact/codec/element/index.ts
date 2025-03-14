import type { Element } from '#src/disreact/model/entity/element';
import {RestElement} from '#src/disreact/model/entity/rest-element.ts';
import {TaskElement} from '#src/disreact/model/entity/task-element.ts';
import {TextLeaf} from '#src/disreact/model/entity/text-leaf.ts';



export const cloneElement = (self: Element): Element => {
  if (TextLeaf.is(self)) {
    return TextLeaf.clone(self);
  }

  if (RestElement.isTag(self)) {
    return RestElement.clone(self);
  }

  return TaskElement.clone(self);
};

export const cloneTree = (self: Element, parent?: Element): Element => {
  const linked = linkParent(self, parent);
  const cloned = cloneElement(linked);

  if (cloned.children.length) {
    cloned.children = cloned.children.map((child) => cloneTree(child, cloned));
  }

  return cloned;
};



export const linkParent = <A extends Element>(node: A, parent?: Element): A => {
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
