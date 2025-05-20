import * as Elem from '#src/disreact/mode/entity/elem.ts';

export const Fragment = undefined;

export const jsx = (type: any, props: any) => {
  if (type === Fragment) {
    return props.children;
  }

  switch (typeof type) {
    case 'string': {
      return Elem.api(type, props);
    }
    case 'function': {
      return Elem.fn(type, props);
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
