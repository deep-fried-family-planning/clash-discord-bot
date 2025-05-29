import * as El from '#src/disreact/mode/entity/el.ts';
import * as Array from 'effect/Array';

export namespace Pragma {

}

export const Fragment = Symbol.for('disreact/Fragment');

export const jsx = (type: any, props: any) => {
  if (type === Fragment) {
    return props.children;
  }

  switch (typeof type) {
    case 'string': {
      const node = El.rest(type, props);
      El.pragmaCs(node);
      return node;
    }
    case 'function': {
      return El.comp(type, props);
    }
  }
  throw new Error(`Invalid JSX type: ${type}`);
};

export const jsxs = (type: any, props: any) => jsx(type, props);

export const jsxDEV = (type: any, props: any) => jsx(type, props);
