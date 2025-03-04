import * as Element from '#src/disreact/codec/element/index.ts';
import * as Utils from '#src/disreact/model/lifecycles/utils.ts';



export const cloneTree = (node: Element.T, parent?: Element.T) => {
  const base  = Utils.linkNodeToParent(node, parent);
  const clone = Element.cloneElement(base);

  if (clone.children.length) {
    clone.children = node.children.map((child) => cloneTree(child, clone));
  }

  return clone;
};
