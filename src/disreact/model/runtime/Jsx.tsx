import type * as Fn from '#disreact/model/entity/Fn.ts';
import * as Internal from '#disreact/model/runtime/internal.ts';
import {globalValue} from 'effect/GlobalValue';
import * as Inspectable from 'effect/Inspectable';

const TypeId = Symbol.for('disreact/Jsx');

export const Fragment = Symbol.for('disreact/Fragment');

export type Type =
  | string
  | typeof Fragment
  | Fn.FC;

export interface Jsx<T extends Type = Type, P = any> extends Inspectable.Inspectable
{
  readonly [TypeId]   : typeof TypeId;
  readonly entrypoint?: string | undefined;
  readonly key        : string | undefined;
  readonly type       : T;
  readonly props      : P;
  readonly ref?       : any | undefined;
  readonly child?     : Child;
  readonly childs?    : Child[];
};

export type Child =
  | undefined | null
  | boolean | number | bigint | string
  | Jsx;

export type Children =
  | Child
  | readonly Child[];

export const isJsx = (u: Children): u is Jsx =>
  u != null &&
  typeof u === 'object' &&
  TypeId in u;

const JsxProto: Jsx = {
  [TypeId]  : TypeId,
  entrypoint: undefined,
  key       : undefined,
  type      : Fragment,
  props     : undefined,
  ref       : undefined,
  child     : undefined,
  childs    : undefined as any,
  ...Inspectable.BaseProto,
  toJSON() {
    const props = {...this.props};
    delete props.children;

    return {
      _id       : 'Jsx',
      entrypoint: this.entrypoint,
      key       : this.key,
      type      : this.type === Fragment ? 'Fragment' : this.type,
      props     : props,
      children  : this.child ?? this.childs,
    };
  },
};

export type Key = string | undefined;

export interface Setup extends Record<string, any> {
  key?: string;
  ref?: any;
};

export const make = (type: Type, setup: Setup, key?: Key): Jsx => {
  const self = Object.create(JsxProto) as Jsx;
  (self.entrypoint as any) = setup.entrypoint;
  (self.key as any) = key;
  (self.type as any) = typeof type === 'function' ? Internal.makeFC(type) : type;
  (self.props as any) = setup;
  (self.child as any) = setup.children;
  return self;
};

export const makeMulti = (type: Type, setup: Setup, key?: Key): Jsx => {
  const self = Object.create(JsxProto) as Jsx;
  (self.entrypoint as any) = setup.entrypoint;
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

export interface Entrypoint {
  id       : string;
  component: Jsx;
}

const entries = globalValue(Fragment, () => new Map<string, Entrypoint>());

export const makeEntrypoint = (id: string, type: Fn.FC | Jsx): Entrypoint => {
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

export const findEntrypoint = (id: string | Fn.FC): Entrypoint | undefined => {
  if (typeof id === 'function') {
    if (!id.entrypoint) {
      return undefined;
    }
    return entries.get(id.entrypoint);
  }
  return entries.get(id);
};

export type Encoding = {
  primitive: string;
  normalize: Record<string, string>;
  transform: Record<string, (self: any, acc: any) => any>;
};

export const encode = (self: Jsx, encoding: Encoding): any => {
  const stack = [self];
  const acc = {};

  return {};
};
