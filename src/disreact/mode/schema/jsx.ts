import * as Elem from '#src/disreact/mode/entity/el.ts';
import * as Array from 'effect/Array';

export const Fragment = undefined;

export const jsx = (type: any, props: any) => {
  if (type === Fragment) {
    return props.children;
  }

  switch (typeof type) {
    case 'string': {
      return Elem.rest(type, props);
    }
    case 'function': {
      return Elem.comp(type, props);
    }
    default: {
      throw new Error(`Invalid JSX type: ${type}`);
    }
  }
};

export const jsxs = (type: any, props: any) => {
  return jsx(type, props);
};

export const jsxDEV = (type: any, props: any) => {
  return jsx(type, props);
};
