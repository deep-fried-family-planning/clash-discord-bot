import type * as Node from '#disreact/core/Node.ts';
import * as node from '#disreact/core/primitives/node.ts';
import type * as FC from '#disreact/core/FC.ts';

export type Text = | undefined
                   | null
                   | boolean
                   | number
                   | bigint
                   | string;

export type Type = | keyof JSX.IntrinsicElements
                   | Text
                   | FC.FC;

export type Jsx = Node.Node;


const makeChild = (type: any): Jsx => {
  if (!type || typeof type !== 'object') {
    return node.text(type);
  }
  if (type._tag) {
    return type;
  }
  return node.list(type);
};


export const Fragment = node.FragmentTag;

export const jsx = (type: any, attributes: any): Jsx => {
  const props = node.props(attributes);

  if (type === Fragment) {
    return node.frag(props.children);
  }
  switch (typeof type) {
    case 'string': {
      return node.rest(type, props);
    }
    case 'function': {
      return node.func(type, props);
    }
  }
  throw new Error(`Invalid type: ${type}`);
};

export const jsxs = (type: any, attributes: any): Jsx => {
  const props = node.props(attributes);

  if (type === Fragment) {
    return node.frag(props.children);
  }
  switch (typeof type) {
    case 'string': {
      return node.rest(type, props);
    }
    case 'function': {
      return node.func(type, props);
    }
  }
  throw new Error(`Invalid type: ${type}`);
};

export const jsxDEV = (type: any, attributes: any): Jsx => {
  const self = Array.isArray(attributes.children)
               ? jsxs(type, attributes)
               : jsx(type, attributes);

  return self;
};
