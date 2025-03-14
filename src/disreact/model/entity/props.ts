import {RESERVED} from '#src/disreact/codec/constants/index.ts';
import type {Element} from '#src/disreact/model/entity/element.ts';
import {Data, Equal} from 'effect';



export * as Props from 'src/disreact/model/entity/props.ts';
export type Props<P = any, C = Element> = Any<P, C>;

export const ZERO = 'ZERO' as const;
export const ONLY = 'ONLY' as const;
export const MANY = 'MANY' as const;

export type WithZero<P> = P & object & {
  _tag     : typeof ZERO;
  children?: null | undefined | never;
};

export type WithOnly<P, C> = P & object & {
  _tag    : typeof ONLY;
  children: C;
};

export type WithMany<P, C> = P & object & {
  _tag    : typeof MANY;
  children: C[];
};

export type WithChildren<P, C> = WithOnly<P, C> | WithMany<P, C>;

export type Any<P, C> =
  | WithZero<P>
  | WithOnly<P, C>
  | WithMany<P, C>;

export const isZero = <P, C>(self: Any<P, C>): self is WithZero<P> => self._tag === ZERO;
export const isOnly = <P, C>(self: Any<P, C>): self is WithOnly<P, C> => self._tag === ONLY;
export const isMany = <P, C>(self: Any<P, C>): self is WithMany<P, C> => self._tag === MANY;

export const ensure = (self: any) => {
  if (!self) {
    return {};
  }

  if (!self.children) {
    self.children = [];
  }
  if (!self.children?.length) {
    self.children = [self.children];
  }
  return self;
};

export const partition = (self: any) => {
  ensure(self);
  const children = self.children;
  delete self.children;
  return children;
};

export const isEqual = (a: Props, b: Props): boolean => {
  const cprops = Data.struct(a);
  const rprops = Data.struct(b);

  return Equal.equals(cprops, rprops);
};

export const isDeepEqual = (a: any, b: any) => {
  if (a === b) return true;
  if (!a || !b) return false;

  const typeA = typeof a;
  const typeB = typeof b;

  if (typeA !== 'object') return false;
  if (typeB !== 'object') return false;

  if (typeof a !== 'object' || typeof b !== 'object') return false;
  if (a.constructor !== b.constructor) return false;
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; ++i) {
      if (!isDeepEqual(a[i], b[i])) return false;
    }
    return true;
  }
};

export const clone = (self: any) => {
  if (!self) {
    return self;
  }

  switch (typeof self) {
    case 'string':
    case 'boolean':
    case 'bigint':
    case 'number':
      return self;

    case 'symbol':
    case 'function': {
      throw new Error(`Invalid Props: ${self}`);
    }
  }

  try {
    return structuredClone(self);
  }
  catch (e) {
    console.warn(e);
  }

  const acc  = {} as any;
  const keys = Object.keys(self);

  for (let i = 0; i < RESERVED.length; i++) {
    if (RESERVED[i]) {
      acc[RESERVED[i]] = self[RESERVED[i]];
    }

    const reserved = RESERVED[i];
  }

  const children = self.children;

  delete self.children;

  const cloned = structuredClone(self);

  self.children = children;

  return cloned;
};
