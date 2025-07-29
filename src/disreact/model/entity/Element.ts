import * as Patch from '#disreact/model/core/Patch.ts';
import * as Traversable from '#disreact/model/core/Traversable.ts';
import type * as Envelope from '#disreact/model/entity/Envelope.ts';
import type * as Hydrant from '#disreact/model/entity/Hydrant.ts';
import * as Jsx from '#disreact/runtime/Jsx.tsx';
import * as Polymer from '#disreact/model/entity/Polymer.ts';
import {ASYNC_CONSTRUCTOR, StructProto} from '#disreact/util/constants.ts';
import {declareProto, declareSubtype} from '#disreact/util/proto.ts';
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

export const eitherComponent = Either.liftPredicate(isComponent, identity);

export const unsafeComponent = flow(
  Option.liftPredicate(isComponent),
  Option.getOrThrow,
);

const ElementPrototype = declareProto<Element>({
  _tag    : INTRINSIC,
  env     : {} as any,
  origin  : undefined,
  parent  : undefined,
  children: undefined,
  polymer : undefined,
  type    : undefined,
  props   : undefined,
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

const fromJsx = (jsx: Jsx.Jsx): Fragment | Intrinsic | Component => {
  switch (typeof jsx.type) {
    case 'string': {
      const self = Object.create(IntrinsicPrototype) as Intrinsic;
      self.type = jsx.type;
      self.props = makeProps(jsx.props);
      return self;
    }
    case 'function': {
      const self = Object.create(ComponentPrototype) as Component;
      self.type = jsx.type as any;
      self.props = makeProps(jsx.props);
      return self;
    }
    case 'symbol': {
      const self = Object.create(FragmentPrototype) as Fragment;
      self.type = jsx.type;
      self.props = makeProps(jsx.props);
      return self;
    }
    default: {
      throw new Error(`Invalid Element type: ${jsx.type}`);
    }
  }
};

const fromJsxChild = (cur: Element, jsx: Jsx.Children, idx: number) => {
  if (!jsx || typeof jsx !== 'object') {
    const self = Object.create(TextPrototype) as Text;
    self.text = jsx;
    return connectChild(self, cur, idx);
  }
  if (Array.isArray(jsx)) {
    const self = Object.create(ListPrototype) as List;
    connectChild(self, cur, idx);
    self.children = fromJsxChilds(self, jsx);
    return self;
  }
  const self = fromJsx(jsx);
  connectChild(self, cur, idx);
  self.children = fromJsxChildren(self, jsx.child ?? jsx.childs);
  return self;
};

const fromJsxChilds = (cur: Element, jsx: Jsx.Child[]) => {
  if (jsx.length === 0) {
    return undefined;
  }
  const children = Array(jsx.length) as Element[];

  for (let i = 0; i < jsx.length; i++) {
    const child = fromJsxChild(cur, jsx[i], i);
    children[i] = connectChild(child, cur, i);
  }
  return children;
};

const fromJsxChildren = (cur: Element, jsx: Jsx.Children) => {
  if (!jsx) {
    return undefined;
  }
  if (Array.isArray(jsx)) {
    return fromJsxChilds(cur, jsx);
  }
  return [fromJsxChild(cur, jsx, 0)];
};

export const fromRender = dual<
  (self: Element) => (jsx: Jsx.Children) => Element[] | undefined,
  (jsx: Jsx.Children, self: Element) => Element[] | undefined
>(2, (jsx, self) => {
  Polymer.commit(self.polymer!);
  if (!jsx) {
    return undefined;
  }
  return [fromJsxChild(self, jsx, 0)];
});

export const bindRenderedJsx = dual<
  (self: Element) => (jsx: Jsx.Children) => Element,
  (jsx: Jsx.Children, self: Element) => Element
>(2, (jsx, self) =>
  self.pipe(
    Traversable.setChildren(fromRender(jsx, self)),
  ),
);

export const renderInto = dual<
  (js: Jsx.Children) => (self: Element) => Element,
  (self: Element, js: Jsx.Children) => Element
>(2, (self, js) => {
  self.children = fromJsxChildren(self, js);
  return self;
});

export const makeRoot = (j: Jsx.Jsx, env: Envelope.Envelope): Element => {
  const root = fromJsx(Jsx.clone(j));
  root.origin = Polymer.make(root);
  root.env = env;
  root.polymer = root.origin;
  root.polymer.type = root.type;
  root.trie = `0.${String(j.type)}`;
  root.step = `0.${String(j.type)}`;
  root.children = fromJsxChildren(root, j.childs ?? j.childs);
  return root;
};

export const connectChild = dual<
  (cur: Element, idx: number) => (self: Element) => Element,
  (self: Element, cur: Element, idx: number) => Element
>(3, (self, cur, idx) => {
  self.origin = cur.polymer ?? cur.origin;
  self.env = cur.env;
  self.parent = cur;
  self.depth = cur.depth + 1;
  self.index = idx;
  self.trie = `${cur.trie}.${self.index}`;
  self.step = `${cur.index}.${cur.type.toString()}.${self.index}.${self.type.toString()}`;
  return self;
});

export const connectWithin = <A extends Element>(self: A): A => {
  if (!self.children) {
    return self;
  }
  const children = self.children;

  for (let i = 0; i < children.length; i++) {
    connectChild(children[i], self, i);
  }
  return self;
};

export const connectAllWithin = <A extends Element>(self: A): A => {
  if (!self.children) {
    return self;
  }
  const children = self.children;

  for (let i = 0; i < children.length; i++) {
    connectChild(children[i], self, i);
  }
  return self;
};

export const getRoot = (self: Element): Element => Traversable.getRootAncestor(self);

const diff = dual<
  (that: Element) => (self: Element) => Patch.Patch<Element>,
  (self: Element, that: Element) => Patch.Patch<Element>
>(2, (self, that) => {
  if (self === that) {
    return Patch.skip(self);
  }
  if (self.type !== that.type) {
    return Patch.replace(self, that);
  }
  if (self.text !== that.text) {
    return Patch.replace(self, that);
  }
  if (!Equal.equals(self.props, that.props)) {
    return Patch.update(self, that);
  }
  if (self.polymer && Polymer.isChanged(self.polymer)) {
    return Patch.update(self, that);
  }
  return Patch.skip(self);
});

export const diffs = dual<
  (self: Element) => (rendered: Element[] | undefined) => Patch.Patch<Element>[] | undefined,
  (rendered: Element[] | undefined, self: Element) => Patch.Patch<Element>[] | undefined
>(2, (rendered, self) => {
  const cs = self.children;
  const rs = rendered;

  if (!cs || cs.length === 0) { // todo key diff algorithm
    if (!rs || rs.length === 0) {
      return undefined;
    }
    const patches = Array(rs.length) as Patch.Patch<Element>[];
    for (let i = 0; i < rs.length; i++) {
      patches[i] = Patch.add(rs[i]);
    }
    return patches;
  }
  if (!rs || rs.length === 0) {
    const patches = Array(cs.length) as Patch.Patch<Element>[];
    for (let i = 0; i < cs.length; i++) {
      patches[i] = Patch.remove(cs[i]);
    }
    return patches;
  }
  const length = Math.max(cs.length, rs.length);
  const patches = Array(length) as Patch.Patch<Element>[];

  for (let i = 0; i < length; i++) {
    const s = cs[i];
    const t = rs[i];

    if (!s && t) {
      patches[i] = Patch.add(t);
    }
    else if (!t) {
      patches[i] = Patch.remove(s);
    }
    else {
      patches[i] = diff(s, t);
    }
  }
  return patches;
});

export const delta = dual<
  (self: Element, changeset?: Patch.Changeset<Element>) => (patches: Patch.Patch<Element>[] | undefined) => Patch.Changeset<Element>,
  (patches: Patch.Patch<Element>[] | undefined, self: Element, changeset?: Patch.Changeset<Element>) => Patch.Changeset<Element>
>(2, (patches, self, changeset) => {
  if (!patches || patches.length === 0) {
    return Patch.changeset(self, changeset);
  }
  const changes = Patch.changeset(self, changeset);
  changes.latest = [];

  for (let i = 0; i < patches.length; i++) {
    const patch = patches[i];

    switch (patch._tag) {
      case 'Skip': {
        changes.latest.push(patch.self);
        continue;
      }
      case 'Update': {
        switch (patch.self._tag) {
          case 'Text': {
            patch.self.text = patch.that.text;
            changes.latest.push(patch.self);
            continue;
          }
          case 'Component': {
            patch.self.props = patch.that.props;
            changes.latest.push(patch.self);
            changes.render.push(patch.self);
            continue;
          }
          default: {
            patch.self.props = patch.that.props;
            changes.latest.push(patch.self);
            changes.changes.push(
              delta(
                diffs(patch.that.children, patch.self),
                patch.self,
                changes,
              ),
            );
            continue;
            // changes.patches.push(patch); todo - might be good to separate diffing from sync patch execution
          }
        }
      }
      case 'Replace': {
        changes.latest.push(patch.that);
        changes.mount.push(patch.that);
        changes.unmount.push(patch.self);
        continue;
      }
      case 'Add': {
        changes.latest.push(patch.that);
        changes.mount.push(patch.that);
        continue;
      }
      case 'Remove': {
        changes.unmount.push(patch.self);
        continue;
      }
    }
  }
  self.children = changes.latest;
  connectWithin(self);
  return changes;
});

export const nextChildren = (self: Element): Element[] | undefined => self.children;

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
  return Option.some(elements[0].env.root); // todo lol
};

export const lowerBoundary = (self: Element): Component[] => {
  const traversal = [] as Component[];
  const stack = [self] as Element[];

  while (stack.length > 0) {
    const cur = stack.pop()!;

    if (!cur.children || cur.children.length === 0) {
      continue;
    }
    for (const c of cur.children.toReversed()) {
      if (isComponent(c)) {
        traversal.push(c);
      }
      else {
        stack.push(c);
      }
    }
  }
  return traversal;
};

export const findChild = dual<
  <A extends Element>(f: (self: Element) => Option.Option<A>) => (self: Element) => Option.Option<A>,
  <A extends Element>(self: Element, f: (self: Element) => Option.Option<A>) => Option.Option<A>
>(2, (self, f) => {
  const stack = [self];

  while (stack.length > 0) {
    const cur = stack.pop()!;
    const res = f(cur);

    if (Option.isSome(res)) {
      return res;
    }
    if (cur.children) {
      stack.push(...cur.children.toReversed());
    }
  }
  return Option.none();
});

export const findParent = dual<
  <A extends Element>(f: (self: Element) => Option.Option<A>) => (self: Element) => Option.Option<A>,
  <A extends Element>(self: Element, f: (self: Element) => Option.Option<A>) => Option.Option<A>
>(2, (self, f) => {
  let cur = self;
  let check = f(cur);

  while (Option.isNone(check)) {
    if (cur.parent) {
      cur = cur.parent;
      check = f(cur);
    }
  }
  return check;
});

export const render = (elem: Element): Effect.Effect<Jsx.Children> => {
  const self = elem as Component;
  self.polymer.phase = 'Render';
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

export const flushUpdates = (self: Element) => Effect.suspend(() => {
  return Effect.whileLoop({
    while: () => false,
    step : () => {},
    body : () => Effect.void,
  });
});

export const flushEffects = (self: Element) => Effect.suspend(() => {
  const polymer = self.polymer;

  if (
    !polymer ||
    !polymer.effects.length
  ) {
    return Effect.void;
  }
  polymer.phase = 'Flush';

  return Effect.whileLoop({
    while: () => false,
    step : () => {},
    body : () => Effect.void,
  });
});

export const initialize = <A extends Element>(self: A): A => {
  if (self._tag !== 'Component') {
    return self;
  }
  self.polymer = Polymer.make(self);
  return self;
};

export const hydrate = dual<
  <A extends Element>(hydrator: Hydrant.Hydrator) => (self: A) => A,
  <A extends Element>(self: A, hydrator: Hydrant.Hydrator) => A
>(2, (self, hydrator) => {
  if (self._tag !== 'Component') {
    return self;
  }
  if (!(self.trie in hydrator.state)) {
    return self;
  }
  const encoded = hydrator.state[self.trie];
  self.polymer = Polymer.fromEncoded(self, encoded);
  delete hydrator.state[self.trie];
  return self;
});

export const dehydrate = dual<
  (states: Polymer.TrieData) => (self: Element) => Polymer.TrieData,
  (self: Element, states: Polymer.TrieData) => Polymer.TrieData
>(2, (self, states) => {
  if (self._tag !== 'Component') {
    return states;
  }
  states[self.trie] = Polymer.toEncoded(self.polymer!);
  return states;
});

export const encode = dual<
  (encoding: Jsx.Encoding) => (self: Element) => Element,
  (self: Element, encoding: Jsx.Encoding) => Element
>(2, (self, that) => {
  const self_ = unsafeComponent(self);
  return self_;
});

export const release = (self: Element) => {
  (self.env as any) = undefined;
  (self.props as any) = undefined;
  self.origin = undefined;
  self.parent = undefined;
  self.children = undefined;

  if (self.polymer) {
    (self.polymer as any) = Polymer.dispose(self.polymer);
  }
};

export const trigger = dual<
  (event: Jsx.Event) => (self: Element) => Effect.Effect<void>,
  (self: Element, event: Jsx.Event) => Effect.Effect<void>
>(2, (self, event) =>
  pipe(
    self.props[event.type],
    Option.fromNullable,
    Effect.flatMap((handler) => {
      if (handler.constructor === ASYNC_CONSTRUCTOR) {
        return Effect.promise(() => handler(event));
      }
      const output = handler(event);

      if (Predicate.isPromise(output)) {
        return Effect.promise(() => output);
      }
      if (Effect.isEffect(output)) {
        return output as Effect.Effect<void>;
      }
      return Effect.void;
    }),
    Effect.orDie,
    Effect.asVoid,
  ),
);
