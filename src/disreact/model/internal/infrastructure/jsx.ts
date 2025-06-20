import {func, rest, trie} from '#src/disreact/model/internal/core/exp/element.ts';
import type * as FC from '#src/disreact/model/internal/infrastructure/fc.ts';
import type * as Equal from 'effect/Equal';
import type * as Hash from 'effect/Hash';
import type * as Pipeable from 'effect/Pipeable';
import * as Element from '#src/disreact/model/internal/core/exp/element.ts';

export const Fragment = undefined;

export const jsx = (type: any, atts: any): Element.Element => {
  if (type === Fragment) {
    return atts.children;
  }
  switch (typeof type) {
    case 'string': {
      if (!atts.children) {
        return Element.rest(type, atts);
      }
      const children = atts.children;
      delete atts.children;
      const el = Element.rest(type, atts);
      el.under = Element.trie(el, [children] as any);
      return el;
    }
    case 'function': {
      return func(type, atts);
    }
  }
  throw new Error(`Invalid jsx type: ${type}`);
};

export const jsxs = (type: any, atts: any): Element.Element => {
  if (type === Fragment) {
    return atts.children;
  }
  switch (typeof type) {
    case 'string': {
      const children = atts.children.flat();
      delete atts.children;
      const el = Element.rest(type, atts);
      el.under = Element.trie(el, children);
      return el;
    }
    case 'function': {
      return Element.func(type, atts);
    }
  }
  throw new Error(`Invalid jsx type: ${type}`);
};

export const jsxDEV = (type: any, atts: any): Element.Element => {
  if (Array.isArray(atts.children)) {
    return jsxs(type, atts);
  }
  return jsx(type, atts);
};
