import type * as Fn from '#disreact/model/core/Fn.ts';
import * as Internal from '#disreact/model/runtime/internal.ts';
import * as Inspectable from 'effect/Inspectable';
import {globalValue} from 'effect/GlobalValue';

export type Type =
  | string
  | typeof Fragment
  | Fn.JsxFC;

export const Fragment = Symbol.for('disreact/Fragment');

export const TypeId = Symbol.for('disreact/Jsx');

export interface Jsx<T extends Type = Type, P = any> extends Inspectable.Inspectable {
  readonly [TypeId]: typeof TypeId;
  readonly ref?    : any | undefined;
  readonly key     : string | undefined;
  readonly type    : T;
  readonly props   : P;
  readonly child?  : Child;
  readonly childs? : Child[];
  readonly src?    : any | undefined;
  readonly ctx?    : any | undefined;
};

const JsxProto: Jsx = {
  [TypeId]: TypeId,
  ref     : undefined,
  key     : undefined,
  type    : Fragment,
  props   : undefined,
  child   : undefined,
  childs  : undefined as any,
  ...Inspectable.BaseProto,
  toJSON() {
    const props = {...this.props};
    delete props.children;

    return {
      _id     : 'Jsx',
      key     : this.key,
      type    : this.type === Fragment ? 'Fragment' : this.type,
      props   : props,
      children: this.child ?? this.childs,
    };
  },
};

export const isJsx = (u: unknown): u is Jsx =>
  u != null &&
  typeof u === 'object' &&
  TypeId in u;

export type Child =
  | undefined | null
  | boolean | number | bigint | string
  | Jsx;

export type Children =
  | Child
  | readonly Child[];

export interface Setup extends Record<string, any> {
  key?: string;
  ref?: any;
};

export const make = (type: Type, setup: Setup, key?: string): Jsx => {
  const self = Object.create(JsxProto) as Jsx;
  (self.key as any) = key;
  (self.type as any) = typeof type === 'function' ? Internal.makeFC(type) : type;
  (self.props as any) = setup;
  (self.child as any) = setup.children;
  return self;
};

export const makeMulti = (type: Type, setup: Setup, key?: string): Jsx => {
  const self = Object.create(JsxProto) as Jsx;
  (self.key as any) = key;
  (self.type as any) = typeof type === 'function' ? Internal.makeFC(type) : type;
  (self.props as any) = setup;
  (self.childs as any) = setup.children;
  return self;
};

export const clone = <A extends Jsx>(self: A): A => {
  return {
    ...self,
    props: {...self.props},
  };
};

export interface Hydrant {
  id   : string;
  props: Record<string, any>;
  state: Record<string, any>;
}

export const hydrant = (id: string, props: any) =>
  ({
    id,
    props,
    state: {},
  });

export interface Encoded<A = any> {
  hydrant: Hydrant;
  type   : string;
  data   : A;
}

export interface Event {
  id: string;
}

export interface Entrypoint {
  id       : string;
  component: Jsx;
}

const entries = globalValue(Fragment, () => new Map<string, Entrypoint>());

export const makeEntrypoint = (id: string, type: Fn.JsxFC | Jsx): Entrypoint => {
  if (entries.has(id)) {
    throw new Error(`Duplicate entrypoint: ${id}`);
  }
  if (typeof type === 'function') {
    const fc = Internal.makeFC(type);
    fc.entrypoint = id;

    return entries
      .set(id, {
        id       : id,
        component: make(fc, {}),
      })
      .get(id)!;
  }
  return entries
    .set(id, {
      id       : id,
      component: type,
    })
    .get(id)!;
};

export const findEntrypoint = (id: string | Fn.JsxFC): Entrypoint | undefined => {
  if (typeof id === 'function') {
    if (!id.entrypoint) {
      return undefined;
    }
    return entries.get(id.entrypoint);
  }
  return entries.get(id);
};
