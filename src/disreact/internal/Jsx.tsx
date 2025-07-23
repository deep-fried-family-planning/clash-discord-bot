import {ASYNC_CONSTRUCTOR} from '#disreact/internal/core/constants.ts';
import type * as Element from '#disreact/internal/Element.ts';
import * as E from 'effect/Effect';
import * as Inspectable from 'effect/Inspectable';
import * as Hash from 'effect/Hash';
import * as Pipeable from 'effect/Pipeable';

export interface FC<P = any> {
  readonly entrypoint?: string;
  displayName?        : string;

  <E = never, R = never>(props: P):
    | Children
    | Promise<Children>
    | E.Effect<Children, E, R>;
}

export const isFC = (u: unknown): u is FC => typeof u === 'function';

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
  const displayName = type.displayName;

  const self = Object.assign(type, Object.create(FCProto)) as Element.FC;

  if (isAsync) {
    self._tag = 'Async';
  }
  self._props = props;
  self.source = source;
  self._id = displayName ? displayName :
             self.name ? self.name :
             'Anonymous';
  return self;
};

export interface Event<A = any> {
  id    : string;
  type  : string;
  target: A;
  close(): void;
  open(jsx: Jsx): void;
  open<P>(fc: FC<P>, props: P): void;
  open<P>(fc: Jsx | FC<P>, props?: P): void;
}

export type Type = | string
                   | typeof Fragment
                   | FC;

const TypeId = Symbol('disreact/Jsx');

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

export const isFalsy = (u: unknown): u is Value => !u;

export const isValue = (u: unknown): u is Value => typeof u !== 'object';

export const isJsx = (u: unknown): u is Jsx =>
  u != null &&
  typeof u === 'object' &&
  TypeId in u;

export const isJsxFragment = (u: Jsx): u is Jsx<typeof Fragment> => u.type === Fragment;

export const isJsxIntrinsic = (u: Jsx): u is Jsx<string> => typeof u.type === 'string';

export const isJsxFC = (u: Jsx): u is Jsx<FC> => typeof u.type === 'function';

export const isChilds = (u: unknown): u is readonly Child[] => Array.isArray(u);

export const Fragment = Symbol('disreact/Fragment');

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

export interface Encoding {
  primitive: string;
  normalize: Record<string, string>;
  transform: Record<
    string,
    (self: {props: any}, acc: any) => any
  >;
}

export const encode = (self: Jsx, encoding: Encoding): any => {
  const stack = [self];
  const acc = {};

  return {};
};

export const stringifyJsx = (self: Jsx): string => {
  return '';
};
