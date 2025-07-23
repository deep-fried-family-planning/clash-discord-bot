import * as Amend from '#disreact/internal/core/Amend.ts';
import {ASYNC_CONSTRUCTOR, StructProto} from '#disreact/internal/core/constants.ts';
import * as Progress from '#disreact/internal/core/Progress.ts';
import * as Traversable from '#disreact/internal/core/Traversable.ts';
import type * as Envelope from '#disreact/internal/Envelope.ts';
import * as Jsx from '#disreact/internal/Jsx.tsx';
import * as Polymer from '#disreact/internal/Polymer.ts';
import type {JsxEncoding} from '#disreact/model/types.ts';
import * as Array from 'effect/Array';
import * as Differ from 'effect/Differ';
import * as E from 'effect/Effect';
import * as Effect from 'effect/Effect';
import * as Either from 'effect/Either';
import type * as Equal from 'effect/Equal';
import {dual, flow, identity, pipe} from 'effect/Function';
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

export interface FC<K extends FCKind = FCKind> extends Inspectable.Inspectable, Hash.Hash {
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

export interface Props extends Inspectable.Inspectable, Equal.Equal, Record<string, any>
{
  onclick? : any | undefined;
  onselect?: any | undefined;
  onsubmit?: any | undefined;
  children?: Jsx.Children;
}

const PropsProto: Props = {
  ...StructProto,
  ...Inspectable.BaseProto,
  toJSON(this: Props) {
    const self = {...this};
    delete self.children;
    return {
      ...self,
    };
  },
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

export interface Elements<T extends Element.Tag = Element.Tag> extends Inspectable.Inspectable,
  Pipeable.Pipeable,
  Equal.Equal,
  PrimaryKey.PrimaryKey,
  Traversable.Origin<Polymer.Polymer>,
  Traversable.Ancestor<Elements>,
  Traversable.Descendent<Elements>,
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

export interface Text extends Elements {
  _tag: typeof TEXT;
  text: any;
}

export interface Fragment extends Elements {
  _tag: typeof FRAGMENT;
  type: typeof Jsx.Fragment;
}

export interface Intrinsic extends Elements {
  _tag : typeof INTRINSIC;
  type : string;
  props: Props;
}

export interface Component extends Elements {
  _tag   : typeof COMPONENT;
  type   : FC;
  polymer: Polymer.Polymer;
  props  : Props;
}

export const isElement = (u: unknown): u is Elements =>
  !!u
  && typeof u === 'object'
  && '_tag' in u;

export const isText = (u: Elements): u is Text => u._tag === TEXT;

export const isFragment = (u: Elements): u is Fragment => u._tag === FRAGMENT;

export const isIntrinsic = (u: Elements): u is Intrinsic => u._tag === INTRINSIC;

export const isComponent = (u: Elements): u is Component => u._tag === COMPONENT;

export const either = Either.liftPredicate(isComponent, identity);

export const unsafeComponent = flow(
  Option.liftPredicate(isComponent),
  Option.getOrThrow,
);

const step = (self: Elements) => `${self.depth}:${self.index}`;
const stepId = (self: Elements) => `${step(self.ancestor!)}:${step(self)}`;
const trieId = (self: Elements) => `${self.ancestor!.trie}:${step(self)}`;
const keyId = (self: Elements) => self.key ?? self.trie;

const ElementProto: Elements = {
  _tag    : INTRINSIC,
  _env    : {} as any,
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
    return `ele${PrimaryKey.value(this.ancestor)}:ope`;
  },
  toJSON(this: Elements) {
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
  },
};

const TextProto = Object.assign(Object.create(ElementProto), {
  _tag: TEXT,
});

const FragmentProto = Object.assign(Object.create(ElementProto), {
  _tag: FRAGMENT,
  type: Jsx.Fragment,
});

const IntrinsicProto: Intrinsic = Object.assign(Object.create(ElementProto), {
  _tag: INTRINSIC,
});

const ComponentProto: Component = Object.assign(Object.create(ElementProto), {
  _tag: COMPONENT,
});

export const makeText = (text: Jsx.Value): Text => {
  const self = Object.create(TextProto) as Text;
  self.text = text;
  return self;
};

export const makeFragment = (children?: Jsx.Children): Fragment => {
  const self = Object.create(FragmentProto) as Fragment;
  self.children = fromJsxChildren(self, children);
  return self;
};

export const makeIntrinsic = (type: string, props: any, children?: Jsx.Children): Intrinsic => {
  const self = Object.create(IntrinsicProto) as Intrinsic;
  self.type = type;
  self.props = makeProps(props);
  self.children = fromJsxChildren(self, children);
  return self;
};

export const makeIntrinsic = (jsx: Jsx.Jsx): Intrinsic => {
  const self = Object.create(IntrinsicProto) as Intrinsic;
  self.type = jsx.type as string;
  self.props = makeProps(jsx.props);
  self.children = fromJsxChildren(self, jsx.child ?? jsx.childs);
  return self;
};

export const makeComponent = (jsx: Jsx.Jsx): Component => {
  const self = Object.create(ComponentProto) as Component;
  self.type = jsx.type as any;
  self.props = makeProps(jsx.props);
  self.polymer = Polymer.make(self);
  return self;
};

export const fromJsx = (jsx: Jsx.Jsx): Fragment | Intrinsic | Component => {
  switch (typeof jsx.type) {
    case 'string':
      return makeIntrinsic(jsx);
    case 'function':
      return makeComponent(jsx);
    case 'symbol':
      return makeFragment(jsx);
    default:
      throw new Error(`Invalid Element type: ${jsx.type}`);
  }
};

export const makeRoot = (jsx: Jsx.Jsx, env: Envelope.Envelope): Elements => {
  const root = fromJsx(Jsx.clone(jsx));
  root._env = env;
  root.trie = step(root);
  root.step = step(root);
  root.children = fromJsxChildren(root, jsx.childs ?? jsx.childs);
  return root;
};

const fromJsxChild = (cur: Elements, jsx: Jsx.Child, index: number): Elements => {
  if (!jsx || typeof jsx !== 'object') {
    const child = makeText(jsx);
    return connectChild(cur, index)(child);
  }
  const child = fromJsx(jsx);
  return connectChild(cur, index)(child);
};

export const fromJsxChildren = (cur: Elements, cs: Jsx.Children): Elements[] | undefined => {
  if (!cs) {
    return undefined;
  }
  if (globalThis.Array.isArray(cs)) {
    const children = [] as Elements[];

    for (let i = 0; i < cs.length; i++) {
      const child = fromJsxChild(cur, cs[i], i);
      children[i] = child;
    }
    return children;
  }
  return [fromJsxChild(cur, cs as Jsx.Child, 0)];
};

const bindChild = dual<
  (self: Elements) => (jsx: Jsx.Child) => Elements,
  (jsx: Jsx.Child, self: Elements) => Elements
>(2, (jsx, self) => {
  return self;
});

export const bindJsx = dual<
  (jsx: Jsx.Children) => (self: Elements) => Elements[] | undefined,
  (self: Elements, jsx: Jsx.Children) => Elements[] | undefined
>(2, (self, jsx) => {
  return fromJsxChildren(self, jsx);
});

export const bindJsxInto = dual<
  (self: Elements) => (jsx: Jsx.Children) => Elements,
  (jsx: Jsx.Children, self: Elements) => Elements
>(2, (jsx, self) => {
  self.children = bindJsx(jsx)(self);
  return self;
});

const connect = (self: Elements, that: Elements, index: number): Elements => {
  that._env = self._env;
  that.ancestor = self;
  that.depth = self.depth + 1;
  that.index = index;
  that.trie = trieId(that);
  that.step = stepId(that);
  return that;
};

export const connectChild = dual<
  (parent: Elements, index?: number) => (self: Elements) => Elements,
  (self: Elements, parent: Elements, index?: number) => Elements
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
  (that: Elements) => (self: Elements) => Elements,
  (self: Elements, that: Elements) => Elements
>(2, (self, that) => {
  self.index = that.index;
  self.props = that.props;
  return self;
});

const replace = (self: Elements, at: number, that: Elements): Elements => {
  return self.children!.splice(at, 1, that)[0];
};

export const remove = (self: Elements, at: number, to: number): Elements[] => {
  return self.children!.splice(at, to - at);
};

export const insert = (self: Elements, at: number, that: Elements[]): Elements => {
  if (!self.children) {
    self.children = that;
    return self;
  }
  self.children.splice(at, 0, ...that);
  return self;
};

export const acceptRender = (self: Elements, rendered: Jsx.Children): Elements => {
  Polymer.commit(self.polymer!);
  const children = fromJsxChildren(self, rendered);
  self.children = children;
  return self;
};

export const normalizeRender = (self: Elements, rendered: Jsx.Children): Elements => {
  Polymer.commit(self.polymer!);
  const children = fromJsxChildren(self, rendered);
  return self;
};

export const findFirst = dual<
  <A extends Elements>(f: (element: Elements) => Option.Option<A>) => (self: Elements) => Option.Option<A>,
  <A extends Elements>(self: Elements, f: (element: Elements) => Option.Option<A>) => Option.Option<A>
>(2, (self, f) =>
  self.pipe(
    Traversable.preOrderEntire,
    Array.findFirst(f), // todo
  ),
);

export const toProgress = (self: Elements): Progress.Partial => {
  return Progress.partial(self._env as any, self);
};

export const toHashSet = (children?: Elements[]) =>
  pipe(
    Option.fromNullable(children),
    Option.map((cs) => cs.map((c) => [keyId(c), c] as const)),
    Option.getOrElse(() => []),
    HashMap.fromIterable,
  );

export const fromHashSet = (cs: HashMap.HashMap<string, Elements>) =>
  cs.pipe(
    Option.liftPredicate(HashMap.isEmpty),
    Option.map(() => undefined),
    Option.getOrElse(() => cs.pipe(HashMap.toValues)),
  );

export const mount = (self: Elements) => {
  return self;
};

export const hydrate = dual<
  (that: Polymer.Bundle) => (self: Elements) => Elements,
  (self: Elements, that: Polymer.Bundle) => Elements
>(2, (input, encoding) =>
  input.pipe(
    unsafeComponent,
    Polymer.fromComponent,
    Polymer.hydrate(encoding),
    Polymer.toComponent,
  ),
);

export const render = (elem: Elements): Effect.Effect<Jsx.Children> => {
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

export const flush = (self: Elements) =>
  pipe(
    Effect.iterate(Polymer.fromComponent(unsafeComponent(self)), {
      while: Polymer.isPending,
      body : flushPolymer,
    }),
    Effect.map(Polymer.toComponent),
  );

export const unmount = (self: Elements) => {
  self.ancestor = undefined;
  self.children = undefined;
  (self._env as any) = undefined;
  (self.props as any) = undefined;

  if (self.polymer) {
    (self.polymer as any) = Polymer.dispose(self.polymer);
  }
};

export const invoke = dual<
  (event: Jsx.Event) => (self: Elements) => Effect.Effect<void>,
  (self: Elements, event: Jsx.Event) => Effect.Effect<void>
>(2, (self, event) => {
  // const handler = self.props[event.type];
  // return Event.invokeWith(event, handler);
  return Effect.void;
});

export const encode = dual<
  (encoding: JsxEncoding) => (self: Elements) => Elements,
  (self: Elements, encoding: JsxEncoding) => Elements
>(2, (self, that) => {
  const self_ = unsafeComponent(self);
  return self_;
});



export const Equivalence = dual<
  (that: Elements) => (self: Elements) => boolean,
  (self: Elements, that: Elements) => boolean
>(2, Equal.equals);

export const TypeDifference = dual<
  (that: Elements) => (self: Elements) => boolean,
  (self: Elements, that: Elements) => boolean
>(2, (a, b) =>
  Equal.equals(a.type, b.type),
);

export const PropsDifference = dual<
  (that: Elements) => (self: Elements) => boolean,
  (self: Elements, that: Elements) => boolean
>(2, (a, b) =>
  Equal.equals(a.props, b.props),
);

export const StateDifference = (a: Elements) =>
  isComponent(a)
  && a.polymer
  && Polymer.isChanged(a.polymer);

export const combine = dual<
  (that: Amend.Amend<Elements>) => (self: Amend.Amend<Elements>) => Amend.Amend<Elements>,
  (self: Amend.Amend<Elements>, that: Amend.Amend<Elements>) => Amend.Amend<Elements>
>(2, (self, that) =>
  Amend.andThen(self, that),
);

export const diff = dual<
  (that: Elements) => (self: Elements) => Amend.Amend<Elements>,
  (self: Elements, that: Elements) => Amend.Amend<Elements>
>(2, (s, t) => {
  if (s === t) {
    return Amend.skip();
  }
  if (s.type !== t.type) {
    return Amend.replace(s, t);
  }
  if (!Equal.equals(s.props, t.props)) {
    return Amend.update(s, t);
  }
  if (s.polymer && s) {
    return Amend.update(s, t);
  }
  return Amend.skip();
});

export const patch = dual<
  (self: Elements) => (patch: Amend.Amend<Elements>) => Elements,
  (patch: Amend.Amend<Elements>, self: Elements) => Elements
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

export const differ = Differ.make({
  empty  : Amend.skip(),
  combine: combine,
  diff   : diff,
  patch  : patch,
});
