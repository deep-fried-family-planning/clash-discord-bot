import {ASYNC_CONSTRUCTOR} from '#disreact/util/constants.ts';
import type * as Element from '#disreact/engine/entity/Element.ts';
import {declareProto, fromProto} from '#disreact/util/proto.ts';
import * as E from 'effect/Effect';
import {globalValue} from 'effect/GlobalValue';
import * as Inspectable from 'effect/Inspectable';
import * as Hash from 'effect/Hash';
import * as Pipeable from 'effect/Pipeable';

export interface FC<P = any> {
  <E = never, R = never>(props: P): Children | Promise<Children> | E.Effect<Children, E, R>;
  readonly entrypoint?: string;
  displayName?        : string;
}

const FCProto: Element.FC = {
  _tag       : undefined,
  _id        : undefined as any,
  _state     : true,
  _props     : true,
  entrypoint : undefined,
  displayName: undefined as any,
  source     : undefined as any,
  signature  : undefined as any,
  ...Inspectable.BaseProto,
  toJSON() {
    return {
      _id        : 'FunctionComponent',
      _tag       : this._tag,
      signature  : this.signature,
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
  [Hash.symbol]() {
    return Hash.cached(this, Hash.string(this.source));
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
                       | Child[];

export const isJsx = (u: unknown): u is Jsx =>
  u != null &&
  typeof u === 'object' &&
  TypeId in u;

export const isJsxFragment = (u: Jsx): u is Jsx<typeof Fragment> => u.type === Fragment;

export const isJsxIntrinsic = (u: Jsx): u is Jsx<string> => typeof u.type === 'string';

export const isJsxFC = (u: Jsx): u is Jsx<FC> => typeof u.type === 'function';

export const isChilds = (u: unknown): u is readonly Child[] => Array.isArray(u);

export const Fragment = Symbol('disreact/Fragment');

const JsxPrototype = declareProto<Jsx>({
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
    const self = clone(this as any);
    delete self.props.children;
    return {
      _id     : 'Jsx',
      key     : self.key,
      type    : self.type === Fragment ? 'Fragment' : self.type,
      props   : self.props,
      children: self.child ?? self.childs,
    };
  },
});

export const intrinsic = (type: string, props: any) => {
  const self = Object.create(JsxPrototype) as Jsx;
  (self.type as any) = type;
  (self.props as any) = props;
  return self;
};

export const component = (type: FC, props: any) => {
  const self = Object.create(JsxPrototype) as Jsx;
  const fc = makeFC(type);
  (self.type as any) = fc;
  (self.props as any) = props;
  (self.entrypoint as any) = fc.entrypoint;
  return self;
};

export const fragment = (props: any) => {
  const self = Object.create(JsxPrototype) as Jsx;
  (self.type as any) = Fragment;
  (self.props as any) = props;
  return self;
};

export const clone = <A extends Jsx>(self: A): A => {
  const cloned = Object.create(JsxPrototype) as A;
  (cloned.key as any) = self.key;
  (cloned.ref as any) = self.ref;
  (cloned.type as any) = self.type;
  (cloned.props as any) = {...self.props};
  (cloned.child as any) = self.child;
  (cloned.childs as any) = self.childs;
  return cloned;
};

const entries = globalValue(TypeId, () => new Map<string, FC>());

export const register = <A extends FC>(id: string, type: A): A => {
  if (entries.has(id)) {
    if (entries.get(id) === type) {
      return type;
    }
    throw new Error(`Duplicate registration of ${id}`);
  }
  const fc = makeFC(type);
  fc.entrypoint = id;
  return type;
};

export const entrypoint = (id: string, props: any): Jsx | undefined => {
  if (!entries.has(id)) {
    return undefined;
  }
  const registered = entries.get(id)!;
  return component(registered, props);
};

export interface Encoding {
  primitive: string;
  normalize: Record<string, string>;
  transform: Record<string, any>;
}

export interface Encodable<
  T extends string = string,
  P = any,
  A extends Record<string, any> = Record<string, any>,
> {
  type : T;
  props: P;
  acc  : {
    [K in keyof A]?: A[K][]
  };
}

export interface Event<A = any> extends Inspectable.Inspectable {
  id    : string;
  type  : string;
  target: A;
  update(jsx: Jsx): void;
  replace(jsx: Jsx): void;
  open(jsx: Jsx): void;
  close(): void;
}

const EventPrototype = declareProto<Event>({
  id     : undefined as any,
  type   : undefined as any,
  target : undefined as any,
  update : undefined as any,
  replace: undefined as any,
  open   : undefined as any,
  close  : undefined as any,
  ...Inspectable.BaseProto,
  toJSON() {
    return {
      _id   : 'Event',
      id    : this.id,
      type  : this.type,
      target: this.target,
    };
  },
});

export interface EventInput<A = any> {
  id    : string;
  type  : string;
  target: A;
}

export const event = <A>(
  input: EventInput<A>,
  methods: Pick<Event, 'update' | 'replace' | 'open' | 'close'>,
): Event<A> => {
  const self = fromProto(EventPrototype) as Event<A>;
  self.id = input.id;
  self.type = input.type;
  self.target = input.target;
  self.update = methods.update;
  self.replace = methods.replace;
  self.open = methods.open;
  self.close = methods.close;
  return self;
};
