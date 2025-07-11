import type * as Element from '#disreact/core/Element.ts';
import type * as FC from '#disreact/core/FC.ts';
import {ELEMENT_FRAGMENT, ELEMENT_FUNCTIONAL} from '#disreact/core/immutable/constants.ts';
import * as elem from '#disreact/core/internal/element.ts';
import * as fc from '#disreact/core/internal/fn.ts';

export type Jsx = Element.Element;

export type Type =
  | typeof Fragment
  | string
  | FC.FC;

export type Attributes = Record<string, any>;

export type Key =
  | string
  | number
  | bigint
  | undefined;

export type Child =
  | Primitive
  | Jsx;

export type Children =
  | Child
  | Child[];

export type Primitive =
  | undefined
  | null
  | boolean
  | number
  | bigint
  | string;

export const Fragment = elem.FragmentSymbol;

export const make = (type: Type, attrs: Attributes, key?: Key): Jsx => {
  const el = elem.create();
  el.key = key ?? attrs.key ?? '';

  if (attrs.ref) {
    el.ref = attrs.ref;
    delete attrs.ref;
  }

  switch (typeof type) {
    case 'string': {
      el.component = type; // todo iterate children?
      el.props = elem.makeHandlerProps(attrs);
      return el;
    }
    case 'function': {
      el._tag = ELEMENT_FUNCTIONAL;
      el.component = elem.registerFC(type);
      el.props = elem.makeProps(attrs);
      el.endpoint = el.component.endpoint;
      return el;
    }
  }
  el._tag = ELEMENT_FRAGMENT; // todo iterate children?
  el.component = type;
  el.props = elem.makeProps(attrs);
  return el;
};

export const multi = (type: Type, attrs: Attributes, key?: Key): Jsx => {
  const el = elem.create();
  el.jsxs = true;
  el.key = key ?? attrs.key ?? '';

  if (attrs.ref) {
    el.ref = attrs.ref;
    delete attrs.ref;
  }

  switch (typeof type) {
    case 'string': {
      el.component = type; // todo iterate children?
      el.props = elem.makeHandlerProps(attrs);
      return el;
    }
    case 'function': {
      el._tag = ELEMENT_FUNCTIONAL;
      el.component = fc.register(type);
      el.props = elem.makeProps(attrs);
      el.endpoint = el.component.endpoint;
      return el;
    }
  }
  el._tag = ELEMENT_FRAGMENT; // todo iterate children?
  el.component = type;
  el.props = elem.makeProps(attrs);
  return el;
};

export type DevSource = {};

export type DevContext = {};

export const makeDEV = (
  type: Type,
  attr: Attributes,
  key: Key,
  src: DevSource,
  ctx: DevContext,
): Jsx => {
  const elem = Array.isArray(attr.children)
               ? multi(type, attr, key)
               : make(type, attr, key);

  elem.src = src;
  elem.ctx = ctx;
  return elem;
};
