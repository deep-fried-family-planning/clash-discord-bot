import {Elem} from '#src/disreact/model/entity/element.ts';
import {RestElement} from '#src/disreact/model/entity/element-rest.ts';
import {TaskElem} from '#src/disreact/model/entity/element-task.ts';
import {LeafElem} from '#src/disreact/model/entity/leaf.ts';
import * as Array from 'effect/Array';
import { Props } from './entity/props.ts';



export * as dsx from './dsx.ts';
export type dsx = any;

export const fragment = Elem.Fragment;

export const single = (t: any, p?: any) => {
  return multi(t, Props.jsx(p));
};

export const multi = (t: any, p: any) => {
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
