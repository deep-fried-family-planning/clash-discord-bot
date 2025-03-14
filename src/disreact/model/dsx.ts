import {Element} from '#src/disreact/model/entity/element.ts';
import {RestElement} from '#src/disreact/model/entity/rest-element.ts';
import {TaskElement} from '#src/disreact/model/entity/task-element.ts';
import {TextLeaf} from '#src/disreact/model/entity/text-leaf.ts';
import * as Array from 'effect/Array';
import { FC } from './entity/fc';



// export * as dsx from './dsx.ts';
// export type dsx = any;

export const fragment = Element.Fragment;

export const single = (type: any, props?: any) => {
  props.children = Array.ensure(props.children).filter(Boolean).flat();
  return multi(type, props);
};

export const multi = (type: any, props: any) => {
  const children = props.children.flat();
  delete props.children;

  switch (typeof type) {
    case 'undefined':
      return children;

    case 'string': {
      const node    = RestElement.make(type, props);
      node.children = connectDirectChildren(node, children);
      return node;
    }

    case 'function': {
      const node    = TaskElement.make(type, props);
      node.children = connectDirectChildren(node, children);
      return node;
    }

    case 'boolean':
    case 'number':
    case 'bigint':
    case 'symbol':
      return TextLeaf.make(type.toString());
  }

  throw new Error(`Unknown Tag: ${type}`);
};

const connectDirectChildren = (parent: Element, children: any[]): Element[] => {
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
        children[i] = TextLeaf.make(String(child));
        continue;
      }
    }

    child.idx = `${child.idx}:${i}`;
  }

  return children as Element[];
};
