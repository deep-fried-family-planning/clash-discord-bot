import * as Patch from '#disreact/model/core/Patch.ts';
import type * as Traversable from '#disreact/model/core/Traversable.ts';
import type * as Envelope from '#disreact/model/entity/Envelope.ts';
import * as Jsx from '#disreact/model/entity/Jsx.tsx';
import * as Polymer from '#disreact/model/entity/Polymer.ts';
import {ASYNC_CONSTRUCTOR, StructProto} from '#disreact/util/constants.ts';
import {declarePrototype, declareSubtype} from '#disreact/util/proto.ts';
import * as E from 'effect/Effect';
import * as Effect from 'effect/Effect';
import * as Either from 'effect/Either';
import * as Equal from 'effect/Equal';
import {dual, flow, identity, pipe} from 'effect/Function';
import type * as Hash from 'effect/Hash';
import * as Inspectable from 'effect/Inspectable';
import * as Option from 'effect/Option';
import * as Pipeable from 'effect/Pipeable';
import * as P from 'effect/Predicate';
import * as Predicate from 'effect/Predicate';
import * as PrimaryKey from 'effect/PrimaryKey';

export type FCKind =
  | 'Sync'
  | 'Async'
  | 'Effect'
  | undefined;

export interface FC<K extends FCKind = FCKind> extends Inspectable.Inspectable, Hash.Hash {
  _tag        : K;
  _id         : string;
  _state      : boolean;
  _props      : boolean;
  entrypoint? : string | undefined;
  displayName?: string;
  source      : string;
  signature?  : Polymer.Signature | undefined;

  <P = any, E = never, R = never>(props?: P):
    K extends 'Sync' ? Jsx.Children :
    K extends 'Async' ? Promise<Jsx.Children> :
    K extends 'Effect' ? Effect.Effect<Jsx.Children, E, R> :
    | Jsx.Children
    | Promise<Jsx.Children>
    | Effect.Effect<Jsx.Children, E, R>;
}

export interface Props extends Inspectable.Inspectable, Equal.Equal, Record<string, any> {
  children?: Jsx.Children;
}

const PropsProto: Props = {
  ...StructProto,
  ...Inspectable.BaseProto,
  toJSON(this: Props) {
    const self = {...this};
    delete self.children;
    return self;
  },
} as Props;

const makeProps = (props: any): Props =>
  ({
    ...props,
    ...PropsProto,
  });

export const TEXT      = 'Text' as const,
             LIST      = 'List' as const,
             FRAGMENT  = 'Fragment' as const,
             INTRINSIC = 'Intrinsic' as const,
             COMPONENT = 'Component' as const;

export declare namespace Element {
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

export interface Element extends Inspectable.Inspectable,
  Pipeable.Pipeable,
  Equal.Equal,
  PrimaryKey.PrimaryKey,
  Traversable.Origin<Polymer.Polymer>,
  Traversable.Ancestor<Element>,
  Traversable.Descendent<Element>,
  Traversable.Key
{
  _tag   : typeof TEXT | typeof LIST | typeof FRAGMENT | typeof INTRINSIC | typeof COMPONENT;
  env    : Envelope.Envelope;
  polymer: Polymer.Polymer | undefined;
  key    : string | undefined;
  type   : any;
  props  : any;
  text   : Jsx.Value;
}

export interface Text extends Element {
  _tag: typeof TEXT;
  text: any;
}

export interface List extends Element {
  _tag: typeof LIST;
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
  _tag   : typeof COMPONENT;
  type   : FC;
  polymer: Polymer.Polymer;
  props  : Props;
}

export const isElement = (u: unknown): u is Element => !!u && typeof u === 'object' && '_tag' in u;

export const isText = (u: Element): u is Text => u._tag === TEXT;

export const isFragment = (u: Element): u is Fragment => u._tag === FRAGMENT;

export const isIntrinsic = (u: Element): u is Intrinsic => u._tag === INTRINSIC;

export const isComponent = (u: Element): u is Component => u._tag === COMPONENT;

export const either = Either.liftPredicate(isComponent, identity);

export const unsafeComponent = flow(
  Option.liftPredicate(isComponent),
  Option.getOrThrow,
);

const step = (self: Element) => `${self.depth}:${self.index}`;
const stepId = (self: Element) => `${step(self.parent!)}:${step(self)}`;
const trieId = (self: Element) => `${self.parent!.trie}:${step(self)}`;
const keyId = (self: Element) => self.key ?? self.trie;

const ElementPrototype = declarePrototype<Element>({
  _tag    : INTRINSIC,
  env     : {} as any,
  origin  : undefined as any,
  parent  : undefined,
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
    if (!this.parent) {
      return 'root';
    }
    return `ele${PrimaryKey.value(this.parent)}:ope`;
  },
  toJSON(this: Element) {
    switch (this._tag) {
      case TEXT: {
        return {
          _tag: this._tag,
          text: this.text,
        };
      }
      case LIST: {
        return {
          _tag    : this._tag,
          children: this.children,
        };
      }
      case FRAGMENT: {
        return {
          _tag    : this._tag,
          children: this.children,
        };
      }
      case INTRINSIC: {
        return {
          _tag    : this._tag,
          type    : this.type,
          props   : this.props,
          children: this.children,
        };
      }
      case COMPONENT: {
        return {
          _tag    : this._tag,
          type    : (this.type as any)._id,
          props   : this.props,
          polymer : this.polymer,
          children: this.children,
        };
      }
    }
  },
});

const TextPrototype = declareSubtype<Text, Element>(ElementPrototype, {
  _tag: TEXT,
});

const ListPrototype = declareSubtype<List, Element>(ElementPrototype, {
  _tag: LIST,
});

const FragmentPrototype = declareSubtype<Fragment, Element>(ElementPrototype, {
  _tag: FRAGMENT,
  type: Jsx.Fragment,
});

const IntrinsicPrototype = declareSubtype<Intrinsic, Element>(ElementPrototype, {
  _tag: INTRINSIC,
});

const ComponentPrototype = declareSubtype<Component, Element>(ElementPrototype, {
  _tag: COMPONENT,
});

const fromJsx = (j: Jsx.Jsx): Fragment | Intrinsic | Component => {
  switch (typeof j.type) {
    case 'string': {
      const self = Object.create(IntrinsicPrototype) as Intrinsic;
      self.type = j.type;
      self.props = makeProps(j.props);
      return self;
    }
    case 'function': {
      const self = Object.create(ComponentPrototype) as Component;
      self.type = j.type as any;
      self.props = makeProps(j.props);
      return self;
    }
    case 'symbol': {
      const self = Object.create(FragmentPrototype) as Fragment;
      self.type = j.type;
      self.props = makeProps(j.props);
      return self;
    }
    default: {
      throw new Error(`Invalid Element type: ${j.type}`);
    }
  }
};

const fromJsxChild = (el: Element, j: Jsx.Children, i: number) => {
  if (!j || typeof j !== 'object') {
    const self = Object.create(TextPrototype) as Text;
    self.text = j;
    self.parent = el;
    self.index = i;
    self.depth = el.depth + 1;
    return self;
  }
  if (Array.isArray(j)) {
    const self = Object.create(ListPrototype) as List;
    self.parent = el;
    self.index = i;
    self.depth = el.depth + 1;
    self.children = fromJsxChilds(self, j);
    return self;
  }
  const self = fromJsx(j);
  self.origin = el.origin;
  self.parent = el;
  self.index = i;
  self.depth = el.depth + 1;
  self.children = fromJsxChildren(self, j.child ?? j.childs);
  return self;
};

const fromJsxChilds = (el: Element, js: Jsx.Child[]) => {
  if (js.length === 0) {
    return undefined;
  }
  const children = [] as Element[];

  for (let i = 0; i < js.length; i++) {
    const child = fromJsxChild(el, js[i], i);
    children[i] = child;
  }
  return children;
};

const fromJsxChildren = (el: Element, js: Jsx.Children) => {
  if (!js) {
    return undefined;
  }
  if (Array.isArray(js)) {
    return fromJsxChilds(el, js);
  }
  return [fromJsxChild(el, js, 0)];
};

export const fromRender = (el: Element, js: Jsx.Children) => {
  Polymer.commit(el.polymer!);
  if (!js) {
    return undefined;
  }
  return [fromJsxChild(el, js, 0)];
};

export const makeRoot = (j: Jsx.Jsx, env: Envelope.Envelope): Element => {
  const root = fromJsx(Jsx.clone(j));
  root.env = env;
  root.polymer = Polymer.make(root);
  root.polymer.type = root.type;
  root.children = fromJsxChildren(root, j.childs ?? j.childs);
  return root;
};

export const connectChild = dual<
  (parent: Element, index?: number) => (self: Element) => Element,
  (self: Element, parent: Element, index?: number) => Element
>(3, (self, parent, index = 0) => {
  self.origin = parent.polymer ?? parent.origin;
  self.env = parent.env;
  self.parent = parent;
  self.depth = parent.depth + 1;
  self.index = index;
  self.trie = trieId(self);
  self.step = stepId(self);
  return self;
});

export const mountWith = dual<
  (polymer: Polymer.Polymer) => (self: Element) => Element,
  (self: Element, polymer: Polymer.Polymer) => Element
>(2, (self, polymer) => {
  self.polymer = polymer;
  return self;
});

export const mount = (self: Element) => {
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

    if (!children || typeof children !== 'object') {
      fc._tag = 'Sync';
      return Effect.succeed(children);
    }
    if (Predicate.isPromise(children)) {
      fc._tag = 'Async';
      return Effect.promise(() => children);
    }
    if (Jsx.isJsx())
    if (!Effect.isEffect(children)) {
      fc._tag = 'Sync';
      return Effect.succeed(children);
    }
    fc._tag = 'Effect';
    return children;
  });
};

export const renderWith = dual<
  (acquire: Effect.Effect<any>, release: Effect.Effect<any>) => (self: Element) => Effect.Effect<Jsx.Children>,
  (self: Element, acquire: Effect.Effect<any>, release: Effect.Effect<any>) => Effect.Effect<Jsx.Children>
>(3, (self, acquire, release) =>
  acquire.pipe(
    Effect.andThen(render(self)),
    Effect.ensuring(release),
  ),
);

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

export const flush = (self: Element) =>
  pipe(
    Effect.succeed(self),
    Effect.as(self),
  );

export const unmount = (self: Element) => {
  self.parent = undefined;
  self.children = undefined;
  (self.env as any) = undefined;
  (self.props as any) = undefined;

  if (self.polymer) {
    (self.polymer as any) = Polymer.dispose(self.polymer);
  }
};

export const invoke = dual<
  (event: Jsx.Event) => (self: Element) => Effect.Effect<void>,
  (self: Element, event: Jsx.Event) => Effect.Effect<void>
>(2, (self, event) => {
  // const handler = self.props[event.type];
  // return Event.invokeWith(event, handler);
  return Effect.void;
});

export const encode = dual<
  (encoding: Jsx.Encoding) => (self: Element) => Element,
  (self: Element, encoding: Jsx.Encoding) => Element
>(2, (self, that) => {
  const self_ = unsafeComponent(self);
  return self_;
});

export const diff = dual<
  (that: Element) => (self: Element) => Patch.Patch<Element>,
  (self: Element, that: Element) => Patch.Patch<Element>
>(2, (s, t) => {
  if (s === t) {
    return Patch.skip();
  }
  if (s.type !== t.type) {
    return Patch.replace(s, t);
  }
  if (s.text !== t.text) {
    return Patch.replace(s, t);
  }
  if (!Equal.equals(s.props, t.props)) {
    return Patch.update(s, t);
  }
  if (s.polymer && s) {
    return Patch.update(s, t);
  }
  return Patch.skip();
});

export const diffChildren = dual<
  (that: Element[] | undefined) => (self: Element) => Patch.Patch<Element>[],
  (self: Element, that: Element[] | undefined) => Patch.Patch<Element>[]
>(2, (s, rs) => {
  if (!s.children && !rs) {
    return [Patch.skip()];
  }
  if (s.children && !rs) {
    return [Patch.skip()];
  }
  return [Patch.skip()];
});

export const patch = dual<
  (self: Element) => (patch: Patch.Patch<Element>) => Element,
  (patch: Patch.Patch<Element>, self: Element) => Element
>(2, (patch, self) => {
  switch (patch._tag) {
    case 'Skip':
      return self;
    case 'Replace':
      return patch.that;
    case 'Update':
      self.text = patch.that.text;
      self.props = patch.that.props;
      return self;
  }
  return self;
});

export const use = dual<
  <A>(f: (self: Element) => A) => (self: Element) => A,
  <A>(self: Element, f: (self: Element) => A) => A
>(2, (self, f) => f(self));

export const lowestCommonAncestor = (flags: Set<Element>): Option.Option<Element> => {
  const elements = [...flags];

  switch (elements.length) {
    case 0: {
      return Option.none();
    }
    case 1: {
      return Option.some(elements[0]);
    }
  }
  return Option.some(elements[0].env.root);
};
