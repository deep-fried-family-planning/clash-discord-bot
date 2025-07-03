import type * as Node from '#disreact/core/Element.ts';
import * as internal from '#disreact/core/internal/element.ts';
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

export type Jsx = Node.Element;

const makeChild = (type: any): Jsx => {
  if (!type || typeof type !== 'object') {
    return internal.text(type);
  }
  if (type._tag) {
    return type;
  }
  return internal.list(type);
};

export const Fragment = internal.FragmentSymbol;

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
