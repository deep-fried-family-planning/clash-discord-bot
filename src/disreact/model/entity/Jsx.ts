import {ASYNC_CONSTRUCTOR} from '#disreact/core/constants.ts';
import type * as Fn from '#disreact/model/entity/Fn.ts';
import * as E from 'effect/Effect';
import * as Inspectable from 'effect/Inspectable';
import * as GlobalValue from 'effect/GlobalValue';

const TypeId = Symbol('disreact/Jsx');

export const Fragment = Symbol.for('disreact/Fragment');

export type Type = | string
                   | typeof Fragment
                   | FC;

export interface Jsx<T extends Type = Type, P = any> extends Inspectable.Inspectable
{
  readonly [TypeId]   : typeof TypeId;
  readonly jsx        : boolean;
  readonly entrypoint?: undefined | string;
  readonly key        : undefined | string;
  readonly type       : T;
  readonly props      : P;
  readonly ref?       : undefined | any;
  readonly child?     : undefined | Child;
  readonly childs?    : undefined | Child[];
}

const JsxProto: Jsx = {
  [TypeId]  : TypeId,
  jsx       : true,
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

export type Value = | null
                    | undefined
                    | boolean
                    | number
                    | bigint
                    | string;

export type Child = | Value
                    | Jsx;

export type Children = | Child
                       | readonly Child[];

export interface FC<P = any> {
  <E = never, R = never>(props: P):
    | Children
    | Promise<Children>
    | E.Effect<Children, E, R>;
}



export type Key = string | undefined;

export interface Setup extends Record<string, any> {
  entrypoint?: string;
  key?       : string;
  ref?       : any;
};

export const make = (type: Type, setup: Setup, key?: Key): Jsx => {
  const self = Object.create(JsxProto) as Jsx;
  (self.entrypoint as any) = setup.entrypoint;
  (self.key as any) = key;
  (self.type as any) = typeof type === 'function' ? makeFC(type) : type;
  (self.props as any) = setup;
  return self;
};

export const cloneChild = <A extends Child>(self: A): A => {
  if (!self || typeof self !== 'object') {
    return self;
  }
  return cloneJsx(self) as A;
};

export const cloneJsx = <A extends Jsx>(self: A): A => {
  const c = Object.create(JsxProto) as A;

  return {
    ...self,
    props: {...self.props},
  };
};

const endpoints = GlobalValue.globalValue(TypeId, () => new Map<string, Fn.FC>());
