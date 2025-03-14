import {Elem} from '#src/disreact/model/element/element.ts';
import { LeafElem } from '#src/disreact/model/element/leaf.ts';
import { RestElement } from '#src/disreact/model/element/rest.ts';
import { TaskElem } from '#src/disreact/model/element/task.ts';
import { Props } from '#src/disreact/model/element/props.ts';



export const fragment = Elem.Fragment;

export const createSingle = (t: any, p?: any) => {
  return createMultiple(t, Props.jsx(p));
};

export const createMultiple = (t: any, p: any) => {
  const children = p.children?.flat() ?? [];

  delete p.children;

  switch (typeof t) {
    case 'undefined':
      return children;

    case 'string': {
      const node    = RestElement.make(t, p);
      node.children = connectDirectChildren(node, children);
      return node;
    }

    case 'function': {
      const node    = TaskElem.make(t, p);
      node.children = connectDirectChildren(node, children);
      return node;
    }

    case 'boolean':
    case 'number':
    case 'bigint':
    case 'symbol':
      return LeafElem.make(t.toString());
  }

  throw new Error(`Unknown Tag: ${t}`);
};

const connectDirectChildren = (parent: Elem, children: any[]): Elem[] => {
  for (let i = 0; i < children.length; i++) {
    const child = children[i];

    if (!child) {
      continue;
    }

    switch (typeof child) {
      case 'function': {
        throw new Error('Function is not allowed as child');
      }

      case 'symbol':
      case 'boolean':
      case 'number':
      case 'bigint':
      case 'string': {
        children[i] = LeafElem.make(String(child));
        continue;
      }
    }

    child.idx = `${child.idx}:${i}`;
  }

  return children as Elem[];
};
