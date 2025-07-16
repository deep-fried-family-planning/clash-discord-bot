/* eslint-disable no-case-declarations */
import {ASYNC_CONSTRUCTOR} from '#disreact/core/constants.ts';
import * as Patch from '#disreact/core/Patch.ts';
import * as Progress from '#disreact/core/Progress.ts';
import type * as Traversable from '#disreact/core/Traversable.ts';
import type * as Envelope from '#disreact/entity/Envelope.ts';
import * as Event from '#disreact/entity/Event.ts';
import * as Fn from '#disreact/entity/Fn.ts';
import * as Polymer from '#disreact/entity/Polymer.ts';
import * as Jsx from '#disreact/runtime/JsxRuntime.tsx';
import * as Differ from 'effect/Differ';
import * as E from 'effect/Effect';
import * as Either from 'effect/Either';
import * as Equal from 'effect/Equal';
import * as Hash from 'effect/Hash';
import * as HashMap from 'effect/HashMap';
import * as Inspectable from 'effect/Inspectable';
import * as Pipeable from 'effect/Pipeable';

export interface Props extends Inspectable.Inspectable, Equal.Equal, Hash.Hash, Record<string, any>
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
  [Hash.symbol]() {
    return Hash.structure(this);
  },
  [Equal.symbol]() {
    throw new Error();
  },
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

const makeRestProps = (props: any): Props => {
  return makeProps(props);
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
  Hash.Hash,
  Traversable.Meta,
  Traversable.Ancestor<Element>,
  Traversable.Descendent<Element>
{
  _tag      : typeof TEXT | typeof FRAGMENT | typeof INTRINSIC | typeof COMPONENT;
  _env      : Envelope.Envelope;
  key?      : string | undefined;
  component?: string | Fn.FC | typeof Jsx.Fragment | undefined;
  props?    : Props | undefined;
  polymer?  : Polymer.Polymer;
  text?     : any;
  rendered? : Element[] | undefined;
}

export const isElement = (u: unknown): u is Element =>
  !!u &&
  typeof u === 'object' &&
  '_tag' in u;

const ElementProto: Element = {
  _tag     : INTRINSIC,
  _env     : undefined as any,
  component: undefined,
  key      : undefined,
  text     : undefined,
  ancestor : undefined,
  children : undefined,
  rendered : undefined,
  trie     : '',
  step     : '',
  depth    : 0,
  index    : 0,
  ...Inspectable.BaseProto,
  ...Pipeable.Prototype,
  [Hash.symbol]() {
    return Hash.structure(this);
  },
  [Equal.symbol]() {
    throw new Error();
  },
  toJSON() {
    return {
      _id     : 'Element',
      _tag    : this._tag,
      key     : this.key,
      props   : this.props,
      polymer : this.polymer,
      children: this.children,
    };
  },
};

export interface Text extends Element {
  _tag: typeof TEXT;
  text: any;
}

export interface Fragment extends Element {
  _tag     : typeof FRAGMENT;
  component: typeof Jsx.Fragment;
}

export interface Intrinsic extends Element {
  _tag     : typeof INTRINSIC;
  component: string;
  props    : Props;
}

export interface Component extends Element {
  _tag     : typeof COMPONENT;
  component: Fn.FC;
  props    : Props;
  polymer  : Polymer.Polymer;
}

export const isText = (self: Element): self is Text => self._tag === 'Text';

export const isFragment = (self: Element): self is Fragment => self._tag === 'Fragment';

export const isIntrinsic = (self: Element): self is Intrinsic => self._tag === 'Intrinsic';

export const isComponent = (self: Element): self is Component => self._tag === 'Component';

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

const makeElem = (jsx: Jsx.Jsx): Fragment | Intrinsic | Component => {
  switch (typeof jsx.type) {
    case 'string':
      const rest = Object.create(IntrinsicProto) as Intrinsic;
      rest.key = jsx.key;
      rest.component = jsx.type as string;
      rest.props = makeRestProps(jsx.props);
      return rest;

    case 'function':
      const func = Object.create(ComponentProto) as Component;
      func.key = jsx.key;
      func.component = jsx.type as Fn.FC;
      func.props = makeProps(jsx.props);
      return func;
  }
  const self = Object.create(FragmentProto) as Fragment;
  self.key = jsx.key;
  self.component = Jsx.Fragment;
  self.props = makeProps(jsx.props);
  return self;
};

export const fromJsx = (jsx: Jsx.Jsx, env: Envelope.Envelope): Element => {
  const root = makeElem(Jsx.clone(jsx));
  root._env = env;
  root.trie = step(root);
  root.step = step(root);
  root.children = fromJsxChildren(root, jsx.childs ?? jsx.childs);
  return root;
};

const fromJsxChild = (cur: Element, c: Jsx.Child, index: number): Element => {
  if (!c || typeof c !== 'object') {
    const child = makeText(c);
    return connect(cur, child, index);
  }
  const child = makeElem(c);
  child.children = fromJsxChildren(child, c.child ?? c.childs);
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

export const fromJsxEntrypoint = (entrypoint: Jsx.Entrypoint, env: Envelope.Envelope): Element => {
  const root = makeElem(Jsx.clone(entrypoint.component));
  root._env = env;
  root.trie = step(root);
  root.step = step(root);
  root.children = fromJsxChildren(root, entrypoint.component.childs ?? entrypoint.component.childs);
  return root;
};

const step = (self: Element) => `${self.depth}:${self.index}`;

const stepId = (self: Element) => `${step(self.ancestor!)}:${step(self)}`;

const trieId = (self: Element) => `${self.ancestor!.trie}:${step(self)}`;

const keyId = (self: Element) => self.key ?? self.trie;

const connect = <A extends Element>(self: Element, that: A, index: number): A => {
  that._env = self._env;
  that.ancestor = self;
  that.depth = self.depth + 1;
  that.index = index;
  that.trie = trieId(that);
  that.step = stepId(that);
  return that;
};

export const toEither = (self: Element) =>
  isComponent(self)
  ? Either.right(self)
  : Either.left(self);

export const diff = (self: Element, that: Element): Patch.Patch<Element> => {
  if (self === that) {
    return Patch.skip();
  }
  if (self._tag !== that._tag) {
    return Patch.replace(that);
  }
  if (self.text !== that.text) {
    return Patch.replace(that);
  }
  if (self.component !== that.component) {
    return Patch.replace(that);
  }
  if (!Equal.equals(self.props, that.props)) {
    return Patch.update(that, true);
  }
  if (self.polymer) {
    if (Polymer.isChanged(self.polymer)) {
      return Patch.skip(true);
    }
  }
  return Patch.skip();
};

export const mount = (self: Component) => {
  self.polymer = Polymer.mount(self);
  return self;
};

export const unmount = (self: Element) => {
  (self._env as any) = undefined;
  (self.props as any) = undefined;
  (self.polymer as any) = Polymer.dispose(self.polymer);
  self.ancestor = undefined;
  self.children = undefined;
};

export const hydrate = (self: Component) => {
  const encoded = self._env.hydrant.state[self.trie];

  if (encoded) {
    self.polymer = Polymer.mount(self, encoded);
    delete self._env.hydrant.state[self.trie];
    return self;
  }
  return self;
};

export const render = (self: Component): E.Effect<Jsx.Children> => {
  return Fn.normalizePropsFC(self.component, self.props);
};

export const renderWith = (
  self: Component,
  acquire: E.Effect<any>,
  onAcquire: () => void,
  release: E.Effect<any>,
  onRelease: () => void,
) =>
  acquire.pipe(
    E.flatMap(() => {
      onAcquire();
      return render(self);
    }),
    E.tap(() => {
      onRelease();
      return release;
    }),
    E.tapDefect(() => {
      onRelease();
      return release;
    }),
  );

export const acceptRender = (self: Component, rendered: Jsx.Children): Component => {
  Polymer.commit(self.polymer);
  const children = fromJsxChildren(self, rendered);
  self.children = children;
  return self;
};

export const normalizeRender = (self: Component, rendered: Jsx.Children): Component => {
  Polymer.commit(self.polymer);
  const children = fromJsxChildren(self, rendered);
  self.rendered = children;
  return self;
};

export const flush = (self: Component) =>
  E.iterate(self, {
    while: (c) => Polymer.isQueued(c.polymer),
    body : (c) => {
      const effector = Polymer.dequeue(c.polymer)!;
      if (effector.constructor === ASYNC_CONSTRUCTOR) {

      }
      return Fn.normalizeEffector(effector).pipe(
        E.as(c),
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

export const diffs = (self: Element, that: Element): Patch.Patches<Element>[] => {
  throw new Error();
};

const childMap = (cs?: Element[]) => {
  if (!cs) {
    return HashMap.empty();
  }
  return HashMap.make(...cs.map((child) => [(child.key ?? child.component) as string, child] as const));
};

const mapChild = (cs: HashMap.HashMap<string, Element>) => {
  if (HashMap.isEmpty(cs)) {
    return undefined;
  }
  return HashMap.toValues(cs);
};

const emptyDiffer = E.succeed();
Differ.or
export const differ = Differ.make({
  empty  : E.succeed(Patch.skip() as Patch.Patch<Element>),
  combine: (a, b) => b,
  diff   : (self: E.Effect<Element>, that) =>
    self.pipe(
      E.zip(that),
      E.map(([self, that]) => diff(self, that)),
    ),
  patch: (patch, self) => {
    switch (patch._tag) {
      case 'Skip': {
        return self;
      }
      case 'Update': {
        self.props = patch.that.props;
        self.text = patch.that.text;
        return self;
      }
      case 'Replace': {
        return patch.that;
      }
    }
    return self;
  },
});

export const toStackPush = (self: Element): Element[] => self.children?.toReversed() ?? [];

export const toProgress = (self: Element): Progress.Partial => {
  return Progress.partial(self._env.entrypoint as any, self);
};

Differ.
