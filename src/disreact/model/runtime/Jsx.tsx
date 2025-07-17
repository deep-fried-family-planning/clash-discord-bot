import {ASYNC_CONSTRUCTOR} from '#disreact/core/constants.ts';
import type * as Element from '#disreact/model/Element.ts';
import * as E from 'effect/Effect';
import * as GlobalValue from 'effect/GlobalValue';
import * as Inspectable from 'effect/Inspectable';
import * as Hash from 'effect/Hash';
import type * as Pipeable from 'effect/Pipeable';

export interface FC<P = any> {
  readonly entrypoint?: string;
  displayName?        : string;

  <E = never, R = never>(props: P):
    | Children
    | Promise<Children>
    | E.Effect<Children, E, R>;
}

const FCProto: Element.FC = {
  _tag       : undefined,
  _id        : undefined as any,
  _state     : true,
  _props     : true,
  entrypoint : undefined,
  displayName: undefined as any,
  source     : undefined as any,
  ...Inspectable.BaseProto,
  [Hash.symbol]() {
    return Hash.cached(this, Hash.string(this.source));
  },
  toJSON() {
    return {
      _id        : 'FunctionComponent',
      _tag       : this._tag,
      entrypoint : this.entrypoint,
      name       : this._id,
      displayName: this.displayName,
      props      : this._props,
      state      : this._state,
    };
  },
  toString() {
    return this._id;
  },
} as Element.FC;

const makeFC = (type: FC): Element.FC => {
  if ('_tag' in type) {
    return type as Element.FC;
  }
  const source = type.toString();
  const props = type.length !== 0;
  const isAsync = type.constructor === ASYNC_CONSTRUCTOR;

  const self = Object.assign(Object.create(FCProto), type) as Element.FC;

  if (isAsync) {
    self._tag = 'Async';
  }
  self._props = props;
  self.source = source;
  self._id = self.displayName ? self.displayName :
             self.name ? self.name :
             'Anonymous';
  return self;
};

export const Fragment = Symbol('disreact/Fragment');

const TypeId = Symbol('disreact/Jsx');

export type Type = | string
                   | typeof Fragment
                   | FC;

export interface Jsx<T extends Type = Type, P = any> extends Inspectable.Inspectable,
  Pipeable.Pipeable
{
  readonly [TypeId]   : typeof TypeId;
  readonly jsx        : boolean;
  readonly entrypoint?: string | undefined;
  readonly key        : string | undefined;
  readonly type       : T;
  readonly props      : P;
  readonly ref?       : any | undefined;
  readonly child?     : Child;
  readonly childs?    : Child[];
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

export const isJsx = (u: unknown): u is Jsx =>
  u != null &&
  typeof u === 'object' &&
  TypeId in u;

export const isChilds = (u: unknown): u is readonly Child[] => Array.isArray(u);

const Proto: Jsx = {
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
  ...Pipeable.Prototype,
  toJSON() {
    const self = clone(this);
    delete self.props.children;

    return {
      _id       : 'Jsx',
      entrypoint: self.entrypoint,
      key       : self.key,
      type      : self.type === Fragment ? 'Fragment' : self.type,
      props     : self.props,
      children  : self.child ?? self.childs,
    };
  },
};

export type Key = | string
                  | undefined;

export interface Setup extends Record<string, any> {
  key?: string;
  ref?: any;
};

export const makeJsx = (type: Type, setup: Setup, key?: Key): Jsx => {
  const self = Object.create(Proto) as Jsx;
  (self.entrypoint as any) = setup.entrypoint;
  (self.key as any) = key;
  (self.type as any) = typeof type === 'function' ? makeFC(type) : type;
  (self.props as any) = setup;
  (self.child as any) = setup.children;
  return self;
};

export const makeJsxs = (type: Type, setup: Setup, key?: Key): Jsx => {
  const self = Object.create(Proto) as Jsx;
  (self.jsx as any) = false;
  (self.entrypoint as any) = setup.entrypoint;
  (self.key as any) = key;
  (self.type as any) = typeof type === 'function' ? makeFC(type) : type;
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

const entries = GlobalValue.globalValue(TypeId, () => new Map<string, FC | Jsx>());

export const makeEntrypoint = <A extends FC | Jsx>(id: string, type: A): A => {
  if (entries.has(id)) {
    throw new Error(`Duplicate entrypoint: ${id}`);
  }
  if (typeof type === 'function') {
    const fc = makeFC(type);
    fc.entrypoint = id;

    return entries
      .set(id, {
        id       : id,
        component: makeJsx(fc, {}),
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

export const findEntrypoint = (id: string | FC): Entrypoint | undefined => {
  return undefined;
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
