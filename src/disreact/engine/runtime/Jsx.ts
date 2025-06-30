import type * as FC from '#src/disreact/core/FC.ts';
import type * as Node from '#src/disreact/core/Node.ts';
import * as node from '#src/disreact/core/primitives/node.ts';

export type Value = | undefined
                    | null
                    | boolean
                    | number
                    | bigint
                    | string;

export type Type = | string
                   | Value
                   | FC.FC;

export type Jsx = Node.Node;

export type Fragment = typeof node.FragmentTag;

export const Fragment = node.FragmentTag;

export const jsx = (type: any, props: any): Jsx => {
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

export const jsxs = (type: any, props: any): Jsx => {
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

export const jsxDEV = (type: any, props: any): Jsx => {
  const self = Array.isArray(props.children)
               ? jsxs(type, props)
               : jsx(type, props);

  return self;
};
