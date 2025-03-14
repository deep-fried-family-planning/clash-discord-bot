import {ONE} from '#src/disreact/codec/constants/common.ts';
import {RESERVED} from '#src/disreact/codec/constants/index.ts';
import {Data, Equal} from 'effect';



export * as Props from 'src/disreact/model/entity/props.ts';
export type Props<P = any, A = any> =
  | None
  | Zero<P, A>
  | Only<P, A>
  | Many<P, A>;

type None = null | undefined | never;
type Zero<P = any, A = any> = Omit<P, 'children' | '_tag'> & {_tag: typeof ZERO; children: never};
type Only<P = any, A = any> = Omit<P, 'children' | '_tag'> & {_tag: typeof ONLY; children: A};
type Many<P = any, A = any> = Omit<P, 'children' | '_tag'> & {_tag: typeof MANY; children: A[]};

export const ZERO = 'ZERO' as const;
export const ONLY = 'ONLY' as const;
export const MANY = 'MANY' as const;

export const isNone = <P, A>(self: Props<P, A>): self is None => self === null || self === undefined;
export const isZero = <P, A>(self: Props<P, A>): self is Zero<P, A> => self?._tag === ZERO;
export const isOnly = <P, A>(self: Props<P, A>): self is Only<P, A> => self?._tag === ONLY;
export const isMany = <P, A>(self: Props<P, A>): self is Many<P, A> => self?._tag === MANY;

export const zero = <P, A>(props: P): Zero<P, A> => {
  (props as any)._tag = ZERO;
  return props as Zero<P, A>;
};

export const only = <P, A>(props: P): Only<P, A> => {
  (props as any)._tag = ONLY;
  return props as Only<P, A>;
};

export const many = <P, A>(props: P): Many<P, A> => {
  (props as any)._tag = MANY;
  return props as Many<P, A>;
};

export const jsx = <P, A>(props: any): None | Zero<P, A> | Only<P, A> => {
  if (!props) {
    return props;
  }

  if (!props.children) {
    props._tag = ZERO;
  }
  else {
    props._tag = ONLY;
    props.children = [props.children];
  }

  return props;
};

export const jsxs = <P, A>(props: any): Many<P, A> => {
  props._tag = MANY;
  return props;
};

export const isEqual = (a: Props, b: Props): boolean => {
  if (a === b) {
    return true;
  }
  if (a === null || b === null) {
    return false;
  }
  if (a === undefined || b === undefined) {
    return false;
  }
  if (a._tag !== b._tag) {
    return false;
  }

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
