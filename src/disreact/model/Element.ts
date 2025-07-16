/* eslint-disable no-case-declarations */
import {StructProto} from '#disreact/core/constants.ts';
import * as Patch from '#disreact/core/Patch.ts';
import * as Progress from '#disreact/core/Progress.ts';
import type * as Traversable from '#disreact/core/Traversable.ts';
import type * as Envelope from '#disreact/model/Envelope.ts';
import * as Event from '#disreact/model/Event.ts';
import * as Fn from '#disreact/model/Fn.ts';
import * as Polymer from '#disreact/model/Polymer.ts';
import * as Jsx from '#disreact/model/runtime/Jsx.tsx';
import * as Effect from 'effect/Effect';
import * as Either from 'effect/Either';
import * as Equal from 'effect/Equal';
import {pipe} from 'effect/Function';
import type * as Hash from 'effect/Hash';
import * as HashMap from 'effect/HashMap';
import * as Inspectable from 'effect/Inspectable';
import * as Option from 'effect/Option';
import * as Pipeable from 'effect/Pipeable';
import * as Predicate from 'effect/Predicate';

export type FCKind = | 'Sync'
                     | 'Async'
                     | 'Effect'
                     | undefined;

export interface FC<K extends FCKind = FCKind> extends Inspectable.Inspectable, Hash.Hash
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
  toJSON() {
    return {
      _id  : 'Props',
      value: {...this},
    };
  },
} as Props;

const makeProps = (props: any): Props => {
  return Object.assign(
    Object.create(PropsProto),
    props,
  );
};

export const TEXT      = 'Text',
             FRAGMENT  = 'Fragment',
             INTRINSIC = 'Intrinsic',
             COMPONENT = 'Component';

export type Type = | Text
                   | Fragment
                   | Intrinsic
                   | Component;

export interface Element extends Inspectable.Inspectable,
  Pipeable.Pipeable,
  Equal.Equal,
  Traversable.Meta,
  Traversable.Ancestor<Element>,
  Traversable.Descendent<Element>
{
  binds?   : Boundary;
  bound    : Boundary;
  _tag     : typeof TEXT | typeof FRAGMENT | typeof INTRINSIC | typeof COMPONENT;
  _env     : Envelope.Envelope;
  key?     : string | undefined;
  type?    : typeof Jsx.Fragment | string | FC | undefined;
  props?   : Props | undefined;
  polymer? : Polymer.Polymer;
  text?    : any;
  rendered?: Element[] | undefined;
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
  _tag   : typeof COMPONENT;
  type   : FC;
  props  : Props;
  polymer: Polymer.Polymer;
}

export const isElement = (u: unknown): u is Element =>
  !!u
  && typeof u === 'object'
  && '_tag' in u;

export const isText = (u: Element): u is Text => u._tag === TEXT;

export const isFragment = (u: Element): u is Fragment => u._tag === FRAGMENT;

export const isIntrinsic = (u: Element): u is Intrinsic => u._tag === INTRINSIC;

export const isComponent = (u: Element): u is Component => u._tag === COMPONENT;

export const isEqual = (a: Element, b: Element) =>
  Equal.equals(a, b);

export const isTypeChanged = (a: Element, b: Element) =>
  a._tag !== b._tag
  || a.type !== b.type;

export const isTextChanged = (a: Element, b: Element) =>
  a.text !== b.text;

export const isPropsChanged = (a: Element, b: Element) =>
  !Equal.equals(a.props, b.props);

export const isStateChanged = (a: Element) =>
  a.polymer
  && Polymer.isChanged(a.polymer);

const ElementProto: Element = {
  _tag    : INTRINSIC,
  _env    : undefined as any,
  binds   : undefined as any,
  bound   : undefined as any,
  type    : undefined,
  key     : undefined,
  text    : undefined,
  ancestor: undefined,
  children: undefined,
  rendered: undefined,
  trie    : '',
  step    : '',
  depth   : 0,
  index   : 0,
  ...StructProto,
  ...Inspectable.BaseProto,
  ...Pipeable.Prototype,
  toJSON() {
    return {
      _id     : 'Element',
      _tag    : this._tag,
      type    : this.type,
      text    : this.text,
      key     : this.key,
      props   : this.props,
      polymer : this.polymer,
      children: this.children,
    };
  },
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

const makeText = (text: any): Text => {
  const self = Object.create(TextProto) as Text;
  self.text = text;
  return self;
};

const make = (jsx: Jsx.Jsx): Fragment | Intrinsic | Component => {
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
      return func;
  }
  const self = Object.create(FragmentProto) as Fragment;
  self.key = jsx.key;
  self.type = Jsx.Fragment;
  self.props = makeProps(jsx.props);
  return self;
};

export interface Boundary {
  source: Element | undefined;
  fanout: Element[];
}

const makeBoundary = (source?: Element): Boundary => {
  return {
    source: source,
    fanout: [],
  };
};

export const makeRoot = (jsx: Jsx.Jsx, env: Envelope.Envelope): Element => {
  const root = make(Jsx.clone(jsx));
  root._env = env;
  root.binds = makeBoundary(root);
  root.bound = root.binds;
  root.trie = step(root);
  root.step = step(root);
  root.children = fromJsxChildren(root, jsx.childs ?? jsx.childs);
  return root;
};

const fromJsxChild = (cur: Element, c: Jsx.Child, index: number): Element => {
  if (!c || typeof c !== 'object') {
    const child = makeText(c);
    child.bound = cur.bound;
    return connect(cur, child, index);
  }
  const child = make(c);
  child.bound = cur.bound;

  if (child._tag === COMPONENT) {
    child.binds = makeBoundary(child);
  }
  else {
    child.children = fromJsxChildren(child, c.child ?? c.childs);
  }
  return connect(cur, child, index);
};

export const fromJsxChildren = (cur: Element, cs: Jsx.Children): Element[] | undefined => {
  if (!cs) {
    return undefined;
  }
  if (Array.isArray(cs)) {
    const children = [] as Element[];

    for (let i = 0; i < cs.length; i++) {
      const child = fromJsxChild(cur, cs[i], i);
      children[i] = child;
    }
    return children;
  }
  return [fromJsxChild(cur, cs as Jsx.Child, 0)];
};

const step = (self: Element) =>
  `${self.depth}:${self.index}`;

const stepId = (self: Element) =>
  `${step(self.ancestor!)}:${step(self)}`;

const trieId = (self: Element) =>
  `${self.ancestor!.trie}:${step(self)}`;

const keyId = (self: Element) =>
  self.key ?? self.trie;

const connect = <A extends Element>(self: Element, that: A, index: number): A => {
  that._env = self._env;
  that.ancestor = self;
  that.depth = self.depth + 1;
  that.index = index;
  that.trie = trieId(that);
  that.step = stepId(that);
  return that;
};

export const update = (self: Element, that: Element): Element => {
  self.props = that.props;
  self.text = that.text;
  throw new Error();
};

export const replace = (self: Element, at: number, that: Element): Element => {
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

export const toStackPush = (self: Element): Element[] =>
  self.children?.toReversed()
  ?? [];

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

export const diffStrict = (self: Element, that: Element) =>
  Equal.equals(self, that)
  ? Option.some(Patch.skip())
  : Option.none();

export const diffType = (self: Element, that: Element) =>
  isTypeChanged(self, that)
  ? Option.some(Patch.replace(self, that))
  : Option.none();

export const diffText = (self: Element, that: Element) =>
  isTextChanged(self, that)
  ? Option.some(Patch.replace(self, that))
  : Option.none();

export const diffProps = (self: Element, that: Element) =>
  isPropsChanged(self, that)
  ? Option.some(Patch.update(self, that))
  : Option.none();

export const diffPolymer = (self: Element, that: Element) =>
  isStateChanged(self)
  ? Option.some(Patch.update(self, that))
  : Option.none();

export const diff = (self: Element, that: Element) => {
  if (isEqual(self, that)) {
    return Patch.skip();
  }
  if (isTypeChanged(self, that)) {
    return Patch.replace(self, that);
  }
  if (isTextChanged(self, that)) {
    return Patch.update(self, that);
  }
  if (isPropsChanged(self, that)) {
    return Patch.update(self, that);
  }
  if (isStateChanged(self)) {
    return Patch.update(self, that);
  }
  return Patch.skip();
};

export const lowestCommonAncestor = (elems: Element[]): Option.Option<Element> =>
  Option.none();

export const unmount = (self: Element) =>
  Effect.sync(() => {
    (self._env as any) = undefined;
    (self.binds as any) = undefined;
    (self.bound as any) = undefined;
    (self.props as any) = undefined;
    (self.polymer as any) = Polymer.dispose(self.polymer);
    self.ancestor = undefined;
    self.children = undefined;
  });

export const mount = (self: Component) => {
  self.polymer = Polymer.mount(self);
  return self;
};

export const hydrate = (self: Component) => {
  throw new Error();
  return self;
};

export const render = (self: Component): Effect.Effect<Jsx.Children> => {
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

export const renderWith = (
  self: Component,
  acquire: Effect.Effect<any>,
  onAcquire: () => void,
  release: Effect.Effect<any>,
  onRelease: () => void,
) =>
  acquire.pipe(
    Effect.flatMap(() => {
      onAcquire();
      return render(self);
    }),
    Effect.tap(() => {
      onRelease();
      return release;
    }),
    Effect.tapDefect(() => {
      onRelease();
      return release;
    }),
    Effect.acquireUseRelease(
      () => {
        onAcquire();
        return render(self);
      },
      (ope) => {
        ope;
        onRelease();
        return release;
      },
    ),
    Effect.map((ope) => ope),
  );

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

export const flush = (self: Component) =>
  Effect.iterate(self, {
    while: (c) => Polymer.isQueued(c.polymer),
    body : (c) => {
      const effector = Polymer.dequeue(c.polymer)!;

      return Fn.normalizeEffector(effector).pipe(
        Effect.as(c),
      );
    },
  });

export const invoke = (self: Intrinsic, event: Event.EventInternal) => {
  const handler = self.props[event.type];
  return Event.invokeWith(event, handler);
};

export const encode = (
  self: Element,
  encoding: Jsx.Encoding,
) => {
  return {} as any;
};
