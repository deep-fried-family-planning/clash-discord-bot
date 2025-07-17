/* eslint-disable no-case-declarations */
import {ASYNC_CONSTRUCTOR, StructProto} from '#disreact/core/constants.ts';
import * as Amend from '#disreact/core/Amend.ts';
import * as Progress from '#disreact/core/Progress.ts';
import * as Traversable from '#disreact/core/Traversable.ts';
import type * as Envelope from '#disreact/model/entity/Envelope.ts';
import * as Event from '#disreact/model/entity/Event.ts';
import type {JsxEncoding} from '#disreact/model/types.ts';
import * as Polymer from '#disreact/model/entity/Polymer.ts';
import * as Jsx from '#disreact/model/runtime/Jsx.tsx';
import * as Array from 'effect/Array';
import * as E from 'effect/Effect';
import * as Effect from 'effect/Effect';
import * as Either from 'effect/Either';
import * as Equal from 'effect/Equal';
import {dual, flow, pipe} from 'effect/Function';
import type * as Hash from 'effect/Hash';
import * as HashMap from 'effect/HashMap';
import * as Inspectable from 'effect/Inspectable';
import * as Option from 'effect/Option';
import * as Pipeable from 'effect/Pipeable';
import * as P from 'effect/Predicate';
import * as Predicate from 'effect/Predicate';
import * as PrimaryKey from 'effect/PrimaryKey';

export type FCKind = | 'Sync'
                     | 'Async'
                     | 'Effect'
                     | undefined;

export interface FC<K extends FCKind = FCKind> extends Inspectable.Inspectable,
  Hash.Hash
{
  _tag        : K;
  _id         : string;
  _state      : boolean;
  _props      : boolean;
  entrypoint? : string | undefined;
  displayName?: string;
  source      : string;
  <P = any, E = never, R = never>(props?: P):
    K extends 'Sync' ? Jsx.Children :
    K extends 'Async' ? Promise<Jsx.Children> :
    K extends 'Effect' ? Effect.Effect<Jsx.Children, E, R> :
    | Jsx.Children
    | Promise<Jsx.Children>
    | Effect.Effect<Jsx.Children, E, R>;
}

export interface Props extends Inspectable.Inspectable,
  Equal.Equal,
  Record<string, any>
{
  onclick? : any | undefined;
  onselect?: any | undefined;
  onsubmit?: any | undefined;
  children?: Jsx.Children;
}

const PropsProto: Props = {
  onclick : undefined,
  onselect: undefined,
  onsubmit: undefined,
  ...StructProto,
  ...Inspectable.BaseProto,
  toJSON  : propsToJSON,
} as Props;

const makeProps = (props: any): Props => {
  return Object.assign(
    Object.create(PropsProto),
    props,
  );
};

export const TEXT      = 'Text' as const,
             FRAGMENT  = 'Fragment' as const,
             INTRINSIC = 'Intrinsic' as const,
             COMPONENT = 'Component' as const;

export namespace Element {
  export type Effect<E = never, R = never> = Effect.Effect<Element, E, R>;
  export type Tag = | typeof TEXT
                    | typeof FRAGMENT
                    | typeof INTRINSIC
                    | typeof COMPONENT;
  export type TType<T extends Tag> =
    T extends typeof TEXT ? undefined :
    T extends typeof FRAGMENT ? typeof Jsx.Fragment :
    T extends typeof INTRINSIC ? string :
    FC;
  export type TProps<T extends Tag> =
    T extends typeof TEXT ? undefined :
    Props;
}

export interface Element<T extends Element.Tag = Element.Tag> extends Inspectable.Inspectable,
  Pipeable.Pipeable,
  Equal.Equal,
  PrimaryKey.PrimaryKey,
  Traversable.Origin<Polymer.Polymer>,
  Traversable.Ancestor<Element>,
  Traversable.Descendent<Element>,
  Traversable.Key
{
  _tag   : T;
  _env   : Envelope.Envelope;
  polymer: Polymer.Polymer | undefined;
  key    : string | undefined;
  type   : Element.TType<T>;
  props  : Element.TProps<T>;
  text   : Jsx.Value;
}

export interface Text extends Element {
  _tag: typeof TEXT;
  text: any;
}

export interface Fragment extends Element {
  _tag: typeof FRAGMENT;
  type: typeof Jsx.Fragment;
}

export interface Intrinsic extends Element {
  _tag : typeof INTRINSIC;
  type : string;
  props: Props;
}

export interface Component extends Element {
  _tag : typeof COMPONENT;
  type : FC;
  props: Props;
}

export const isElement = (u: unknown): u is Element =>
  !!u
  && typeof u === 'object'
  && '_tag' in u;

export const isText = (u: Element): u is Text => u._tag === TEXT;

export const isFragment = (u: Element): u is Fragment => u._tag === FRAGMENT;

export const isIntrinsic = (u: Element): u is Intrinsic => u._tag === INTRINSIC;

export const isComponent = (u: Element): u is Component => u._tag === COMPONENT;

export const unsafeComponent = flow(
  Option.liftPredicate(isComponent),
  Option.getOrThrow,
);

export const Equivalence = dual<
  (that: Element) => (self: Element) => boolean,
  (self: Element, that: Element) => boolean
>(2, Equal.equals);

export const TypeDifference = dual<
  (that: Element) => (self: Element) => boolean,
  (self: Element, that: Element) => boolean
>(2, (a, b) => Equal.equals(a.type, b.type));

export const PropsDifference = dual<
  (that: Element) => (self: Element) => boolean,
  (self: Element, that: Element) => boolean
>(2, (a, b) => Equal.equals(a.props, b.props));

export const StateDifference = (a: Element) =>
  isComponent(a)
  && a.polymer
  && Polymer.isChanged(a.polymer);

const step = (self: Element) =>
  `${self.depth}:${self.index}`;

const stepId = (self: Element) =>
  `${step(self.ancestor!)}:${step(self)}`;

const trieId = (self: Element) =>
  `${self.ancestor!.trie}:${step(self)}`;

const keyId = (self: Element) =>
  self.key ?? self.trie;

export const using = dual<
  <A>(f: (self: Element) => A) => (self: Element) => A,
  <A>(self: Element, f: (self: Element) => A) => A
>(2, (self, f) => f(self));

export const modify = dual<
  <A>(f: (self: Element) => A) => (self: Element) => Element,
  <A>(self: Element, f: (self: Element) => A) => Element
>(2, (self, f) => {
  const that = f(self);
  return update(self)(that);
});

const ElementProto: Element = {
  _tag    : INTRINSIC,
  _env    : undefined as any,
  origin  : undefined as any,
  ancestor: undefined,
  children: undefined,
  polymer : undefined as any,
  type    : undefined,
  props   : undefined as any,
  key     : undefined,
  text    : undefined,
  trie    : '',
  step    : '',
  depth   : 0,
  index   : 0,
  ...StructProto,
  ...Inspectable.BaseProto,
  ...Pipeable.Prototype,
  [PrimaryKey.symbol]() {
    if (!this.ancestor) {
      return 'root';
    }
    return `${PrimaryKey.value(this.ancestor)}`;
  },
  toJSON: elementToJSON,
};

const TextProto: Text = Object.assign(Object.create(ElementProto), {
  _tag: TEXT,
});

const FragmentProto: Fragment = Object.assign(Object.create(ElementProto), {
  _tag: FRAGMENT,
});

const IntrinsicProto: Intrinsic = Object.assign(Object.create(ElementProto), {
  _tag: INTRINSIC,
});

const ComponentProto: Component = Object.assign(Object.create(ElementProto), {
  _tag: COMPONENT,
});

const fromJsx = (jsx: Jsx.Jsx): Fragment | Intrinsic | Component => {
  switch (typeof jsx.type) {
    case 'string':
      const rest = Object.create(IntrinsicProto) as Intrinsic;
      rest.key = jsx.key;
      rest.type = jsx.type as string;
      rest.props = makeProps(jsx.props);
      return rest;

    case 'function':
      const func = Object.create(ComponentProto) as Component;
      func.key = jsx.key;
      func.type = jsx.type as FC;
      func.props = makeProps(jsx.props);
      func.polymer = Polymer.make(func);
      return func;

    case 'symbol':
      const fragment = Object.create(FragmentProto) as Fragment;
      fragment.key = jsx.key;
      fragment.type = jsx.type;
      fragment.props = makeProps(jsx.props);
      return fragment;

    default:
      throw new Error(`Invalid Element type: ${jsx.type}`);
  }
};

export const makeRoot = (jsx: Jsx.Jsx, env: Envelope.Envelope): Element => {
  const root = fromJsx(Jsx.clone(jsx));
  root._env = env;
  root.trie = step(root);
  root.step = step(root);
  root.children = fromJsxChildren(root, jsx.childs ?? jsx.childs);
  return root;
};

const fromJsxChild = (cur: Element, jsx: Jsx.Child, index: number): Element => {
  if (!jsx || typeof jsx !== 'object') {
    const child = Object.create(TextProto) as Text;
  child.text = jsx;
    return connectChild(cur, child, index);
  }
  const child = fromJsx(jsx);
  return connect(cur, child, index);
};

export const fromJsxChildren = (cur: Element, cs: Jsx.Children): Element[] | undefined => {
  if (!cs) {
    return undefined;
  }
  if (globalThis.Array.isArray(cs)) {
    const children = [] as Element[];

    for (let i = 0; i < cs.length; i++) {
      const child = fromJsxChild(cur, cs[i], i);
      children[i] = child;
    }
    return children;
  }
  return [fromJsxChild(cur, cs as Jsx.Child, 0)];
};



const connect = (self: Element, that: Element, index: number): Element => {
  that._env = self._env;
  that.ancestor = self;
  that.depth = self.depth + 1;
  that.index = index;
  that.trie = trieId(that);
  that.step = stepId(that);
  return that;
};

export const connectChild = dual<
  (parent: Element, index?: number) => (self: Element) => Element,
  (self: Element, parent: Element, index?: number) => Element
>(3, (self, parent, index = 0) => {
  self.origin = parent.polymer ?? parent.origin;
  self._env = parent._env;
  self.ancestor = parent;
  self.depth = parent.depth + 1;
  self.index = index;
  self.trie = trieId(self);
  self.step = stepId(self);
  return self;
});

export const update = dual<
  (that: Element) => (self: Element) => Element,
  (self: Element, that: Element) => Element
>(2, (self, that) => {
  self.index = that.index;
  self.props = that.props;
  return self;
});

const replace = (self: Element, at: number, that: Element): Element => {
  return self.children!.splice(at, 1, that)[0];
};

export const remove = (self: Element, at: number, to: number): Element[] => {
  return self.children!.splice(at, to - at);
};

export const insert = (self: Element, at: number, that: Element[]): Element => {
  if (!self.children) {
    self.children = that;
    return self;
  }
  self.children.splice(at, 0, ...that);
  return self;
};

export const toEither = (self: Element): Either.Either<Component, Element> =>
  isComponent(self)
  ? Either.right(self)
  : Either.left(self);
Array.ensure;

export const toKey = (s: Element) =>
  Option.fromNullable(s.key);

export const toType = (s: Element) =>
  Option.fromNullable(s.type);

export const toProps = (s: Element) =>
  Option.fromNullable(s.props);

export const toChildren = (s: Element) =>
  Option.fromNullable(s.children);

export const toStackPush = (self: Element) =>
  self.pipe(
    Traversable.toReversedChildren,
    Option.fromNullable,
  );

export const toProgress = (self: Element): Progress.Partial => {
  return Progress.partial(self._env.entrypoint as any, self);
};

export const toHashSet = (children?: Element[]) =>
  pipe(
    Option.fromNullable(children),
    Option.map((cs) => cs.map((c) => [keyId(c), c] as const)),
    Option.getOrElse(() => []),
    HashMap.fromIterable,
  );

export const fromHashSet = (cs: HashMap.HashMap<string, Element>) =>
  cs.pipe(
    Option.liftPredicate(HashMap.isEmpty),
    Option.map(() => undefined),
    Option.getOrElse(() => cs.pipe(HashMap.toValues)),
  );

export const combine = dual<
  (that: Amend.Amend<Element>) => (self: Amend.Amend<Element>) => Amend.Amend<Element>,
  (self: Amend.Amend<Element>, that: Amend.Amend<Element>) => Amend.Amend<Element>
>(2, (self, that) =>
  Amend.andThen(self, that),
);

export const diff = dual<
  (that: Element) => (self: Element) => Amend.Amend<Element>,
  (self: Element, that: Element) => Amend.Amend<Element>
>(2, (s, t) => {
  if (Equivalence(s, t)) {
    return Amend.skip();
  }
  if (TypeDifference(s, t)) {
    return Amend.replace(s, t);
  }
  if (PropsDifference(s, t)) {
    return Amend.update(s, t);
  }
  if (StateDifference(s)) {
    return Amend.update(s, t);
  }
  return Amend.skip();
});

export const patch = dual<
  (self: Element) => (patch: Amend.Amend<Element>) => Element,
  (patch: Amend.Amend<Element>, self: Element) => Element
>(2, (patch, self) => {
  switch (patch._tag) {
    case 'Skip':
      return self;
    case 'Replace':
      return patch.that;
    case 'Update':
      return update(self)(patch.that);
  }
  return self;
});

export const mount = (input: Element) => {
  const self = unsafeComponent(input);
  self.polymer = Polymer.make(self);
  return self;
};

export const hydrate = dual<
  (that: Polymer.Bundle) => (self: Element) => Element,
  (self: Element, that: Polymer.Bundle) => Element
>(2, (input, encoding) =>
  input.pipe(
    unsafeComponent,
    Polymer.fromComponent,
    Polymer.hydrate(encoding),
    Polymer.toComponent,
  ),
);

export const unmount = (self: Element) => Effect.sync(() => {
  (self._env as any) = undefined;
  (self.props as any) = undefined;
  (self.polymer as any) = Polymer.dispose(self.polymer);
  self.ancestor = undefined;
  self.children = undefined;
});

export const render = (elem: Element): Effect.Effect<Jsx.Children> => {
  const self = elem as Component;
  const fc = self.type;

  switch (fc._tag) {
    case 'Sync': {
      return Effect.sync(() => fc(self.props) as Jsx.Children);
    }
    case 'Async': {
      return Effect.promise(() => fc(self.props) as Promise<Jsx.Children>);
    }
    case 'Effect': {
      return Effect.suspend(() => fc(self.props) as Effect.Effect<Jsx.Children>);
    }
  }
  return Effect.suspend(() => {
    const children = fc(self.props);

    if (Predicate.isPromise(children)) {
      fc._tag = 'Async';
      return Effect.promise(() => children);
    }
    if (!Effect.isEffect(children)) {
      fc._tag = 'Sync';
      return Effect.succeed(children);
    }
    fc._tag = 'Effect';
    return children;
  });
};

export const bindRender = dual<
  (that: Element) => (children: Element) => Element,
  (self: Element, that: Element) => Element
>(2, (self, that) => {
  const self_ = unsafeComponent(self);
  const that_ = unsafeComponent(that);
  self_.binds = that_;
  return self_;
});

export const acceptRender = (self: Component, rendered: Jsx.Children): Component => {
  Polymer.commit(self.polymer);
  const bound = self.bound;
  self.bound = self.binds!;
  const children = fromJsxChildren(self, rendered);
  self.children = children;
  self.bound = bound;
  return self;
};

export const normalizeRender = (self: Component, rendered: Jsx.Children): Component => {
  Polymer.commit(self.polymer);
  const bound = self.bound;
  self.bound = self.binds!;
  const children = fromJsxChildren(self, rendered);
  self.rendered = children;
  self.bound = bound;
  return self;
};

const normalizeEffector = (effector: Polymer.Effector) => {
  if (typeof effector === 'object') {
    return effector;
  }
  if (effector.constructor === ASYNC_CONSTRUCTOR) {
    return E.promise(() => effector() as Promise<void>);
  }
  return E.suspend(() => {
    const output = effector();

    if (P.isPromise(output)) {
      return E.promise(() => output);
    }
    if (!E.isEffect(output)) {
      return E.void;
    }
    return output;
  });
};

const flushPolymer = (polymer: Polymer.Polymer) => {
  const updater = Polymer.dequeue(polymer)!;

  switch (updater._tag) {
    case 'State':
      return Effect.as(
        Effect.sync(updater.action),
        polymer,
      );

    case 'Effect':
      return Effect.as(
        normalizeEffector(updater.monomer.update),
        polymer,
      );
  }
};

export const flush = (self: Element) =>
  pipe(
    Effect.iterate(Polymer.fromComponent(unsafeComponent(self)), {
      while: Polymer.isPending,
      body : flushPolymer,
    }),
    Effect.map(Polymer.toComponent),
  );

export const invoke = (self: Intrinsic, event: Event.EventInternal) => {
  const handler = self.props[event.type];
  return Event.invokeWith(event, handler);
};

export const findFirst = dual<
  <A extends Element>(f: (element: Element) => Option.Option<A>) => (self: Element) => Option.Option<A>,
  <A extends Element>(self: Element, f: (element: Element) => Option.Option<A>) => Option.Option<A>
>(2, (self, f) =>
  self.pipe(
    Traversable.preOrderEntire,
    Array.findFirst(f), // todo
  ),
);

export const encode = dual<
  (encoding: JsxEncoding) => (self: Element) => Element,
  (self: Element, encoding: JsxEncoding) => Element
>(2, (self, that) => {
  const self_ = unsafeComponent(self);
  const that_ = unsafeComponent(that);
  self_.polymer = Polymer.encode(self_.polymer, that_.polymer);
  return self_;
});

function propsToJSON(this: Props) {
  return {
    _id  : 'Props',
    value: {
      ...this,
    },
  };
}

function elementToJSON(this: Element) {
  switch (this._tag) {
    case TEXT:
      return {
        _tag: this._tag,
        text: this.text,
      };

    case FRAGMENT:
      return {
        _tag    : this._tag,
        children: this.children,
      };

    case INTRINSIC:
      return {
        _tag    : this._tag,
        type    : this.type,
        props   : this.props,
        children: this.children,
      };

    case COMPONENT:
      return {
        _tag    : this._tag,
        type    : (this.type as any)._id,
        props   : this.props,
        polymer : this.polymer,
        children: this.children,
      };
  }
}
