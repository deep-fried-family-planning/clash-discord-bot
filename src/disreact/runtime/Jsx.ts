import type * as Node from '#disreact/core/Element.ts';
import * as element from '#disreact/core/internal/element.ts';
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

export const Fragment = element.FragmentSymbol;

export const jsx = (type: any, config: any, key?: string): Jsx => {
  if (type === Fragment) {
    return element.frag(config.children);
  }
  switch (typeof type) {
    case 'string': {
      return element.rest(type, config);
    }
    case 'function': {
      return element.func(type, config);
    }
  }
  throw new Error(`Invalid type: ${type}`);
};

export const jsxs = (type: any, props: any, key?: string): Jsx => {
  if (type === Fragment) {
    return element.frag(props.children);
  }
  switch (typeof type) {
    case 'string': {
      return element.rest(type, props);
    }
    case 'function': {
      return element.func(type, props);
    }
  }
  throw new Error(`Invalid type: ${type}`);
};
