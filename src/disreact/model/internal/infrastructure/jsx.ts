import * as Element from '#src/disreact/model/internal/element.ts';
import * as Array from 'effect/Array';

export const Fragment = undefined;

export const jsx = (type: any, atts: any): Element.Element => {
  if (type === Fragment) {
    return atts.children;
  }
  switch (typeof type) {
    case 'string': {
      if (!atts.children) {
        return Element.intrinsic(type, atts);
      }
      const children = atts.children;
      delete atts.children;
      const el = Element.intrinsic(type, atts);
      el.rs = Element.trie(el, [children] as any);
      return el;
    }
    case 'function': {
      return Element.instance(type, atts);
    }
  }
  throw new Error(`Invalid element type: ${String(type)}`);
};

export const jsxs = (type: any, atts: any): Element.Element => {
  if (type === Fragment) {
    return atts.children;
  }
  switch (typeof type) {
    case 'string': {
      const children = atts.children.flat();
      delete atts.children;
      const el = Element.intrinsic(type, atts);
      el.rs = Element.trie(el, children);
      return el;
    }
    case 'function': {
      return Element.instance(type, atts);
    }
  }
  throw new Error(`Invalid element type: ${String(type)}`);
};

export const jsxDEV = (type: any, atts: any): Element.Element => {
  if (Array.isArray(atts.children)) {
    return jsxs(type, atts);
  }
  return jsx(type, atts);
};
