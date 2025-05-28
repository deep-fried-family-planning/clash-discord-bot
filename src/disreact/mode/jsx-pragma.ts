import * as Elem from '#src/disreact/mode/entity/el.ts';
import * as Array from 'effect/Array';

export const Fragment = Symbol.for('disreact/Fragment');

export const jsx = (type: any, props: any) => {
  if (type === Fragment) {
    return props.children;
  }

  switch (typeof type) {
    case 'string': {
      const node = Elem.rest(type, props);
      return node;
    }
    case 'function': {
      return Elem.component(type, props);
    }
  }
  throw new Error(`Invalid JSX type: ${type}`);
};

export const jsxs = (type: any, props: any) => {
  return jsx(type, props);
};

export const jsxDEV = (type: any, props: any) => {
  return jsx(type, props);
};
