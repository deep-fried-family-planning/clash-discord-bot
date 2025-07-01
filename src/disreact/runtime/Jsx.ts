import type * as Node from '#disreact/engine/entity/Node.ts';
import * as internal from '#disreact/core/primitives/node.ts';
import type * as FC from '#disreact/engine/entity/FC.ts';

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
    return internal.text(type);
  }
  if (type._tag) {
    return type;
  }
  return internal.list(type);
};


export const Fragment = internal.FragmentTag;

export const jsx = (type: any, props: any): Jsx => {
  if (type === Fragment) {
    return internal.frag(props.children);
  }
  switch (typeof type) {
    case 'string': {
      return internal.rest(type, props);
    }
    case 'function': {
      return internal.func(type, props);
    }
  }
  throw new Error(`Invalid type: ${type}`);
};

export const jsxs = (type: any, props: any): Jsx => {
  if (type === Fragment) {
    return internal.frag(props.children);
  }
  switch (typeof type) {
    case 'string': {
      return internal.rest(type, props);
    }
    case 'function': {
      return internal.func(type, props);
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
