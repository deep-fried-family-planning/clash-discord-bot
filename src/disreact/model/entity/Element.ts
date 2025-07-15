import {ASYNC_CONSTRUCTOR} from '#disreact/core/constants.ts';
import * as Fn from '#disreact/model/entity/Fn.ts';
import * as Patch from '#disreact/core/Patch.ts';
import * as Polymer from '#disreact/model/entity/Polymer.ts';
import * as Progress from '#disreact/core/Progress.ts';
import type * as Traversable from '#disreact/core/Traversable.ts';
import type * as Envelope from '#disreact/model/entity/Envelope.ts';
import * as Event from '#disreact/model/entity/Event.ts';
import * as Jsx from '#disreact/model/runtime/Jsx.tsx';
import * as Differ from 'effect/Differ';
import * as E from 'effect/Effect';
import * as Either from 'effect/Either';
import * as Equal from 'effect/Equal';
import * as Hash from 'effect/Hash';
import * as HashMap from 'effect/HashMap';
import * as Inspectable from 'effect/Inspectable';
import * as Pipeable from 'effect/Pipeable';

export const TEXT      = 'Text',
             FRAGMENT  = 'Fragment',
             INTRINSIC = 'Intrinsic',
             COMPONENT = 'Component';

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

const ElementPrototype: Element = {
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
  ...Pipeable.Prototype,
  ...Inspectable.BaseProto,
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

export type Type = | Text
                   | Fragment
                   | Intrinsic
                   | Component;

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

const TextProto: Text = Object.assign(Object.create(ElementPrototype), {
  _tag: TEXT,
});

const FragmentProto: Fragment = Object.assign(Object.create(ElementPrototype), {
  _tag: FRAGMENT,
});

const IntrinsicProto: Intrinsic = Object.assign(Object.create(ElementPrototype), {
  _tag: INTRINSIC,
});

const ComponentProto: Component = Object.assign(Object.create(ElementPrototype), {
  _tag: COMPONENT,
});


export interface Props extends Inspectable.Inspectable,
  Equal.Equal,
  Hash.Hash,
  Record<string, any>
{
  onclick?          : any | undefined;
  onselect?         : any | undefined;
  onsubmit?         : any | undefined;
  readonly children?: Jsx.Children;
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

export const isComponent = (self: Element): self is Component =>
  self._tag === 'Component';

export const toEither = (self: Element): Either.Either<Component, Element> =>
  isComponent(self)
  ? Either.right(self)
  : Either.left(self);

const step = (self: Element) => `${self.depth}:${self.index}`;
const stepId = (self: Element) => `${step(self.ancestor!)}:${step(self)}`;
const trieId = (self: Element) => `${self.ancestor!.trie}:${step(self)}`;
const keyId = (self: Element) => self.key ?? self.trie;

const makeText = (text: any): Text => {
  const self = Object.create(TextProto) as Text;
  self.text = text;
  return self;
};

const make = (jsx: Jsx.Jsx): Fragment | Intrinsic | Component => {
  switch (typeof jsx.type) {
    case 'string': {
      const self = Object.create(IntrinsicProto) as Intrinsic;
      self.key = jsx.key;
      self.component = jsx.type as string;
      self.props = makeRestProps(jsx.props);
      return self;
    }
    case 'function': {
      const self = Object.create(ComponentProto) as Component;
      self.key = jsx.key;
      self.component = jsx.type as Fn.FC;
      self.props = makeProps(jsx.props);
      return self;
    }
  }
  const self = Object.create(FragmentProto) as Fragment;
  self.key = jsx.key;
  self.component = Jsx.Fragment;
  self.props = makeProps(jsx.props);
  return self;
};

const connect = <A extends Element>(self: Element, that: A, index: number): A => {
  that._env = self._env;
  that.ancestor = self;
  that.depth = self.depth + 1;
  that.index = index;
  that.trie = trieId(that);
  that.step = stepId(that);
  return that;
};

const fromJsxChild = (cur: Element, c: Jsx.Child, index: number): Element => {
  if (!c || typeof c !== 'object') {
    const child = makeText(c);
    return connect(cur, child, index);
  }
  const child = make(c);
  child.children = fromJsxChildren(child, child.props?.children);
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

export const fromJsx = (jsx: Jsx.Jsx, env: Envelope.Envelope): Element => {
  const root = make(Jsx.clone(jsx));
  root._env = env;
  root.trie = step(root);
  root.step = step(root);
  root.children = fromJsxChildren(root, jsx.childs ?? jsx.childs);
  return root;
};

export const fromJsxEntrypoint = (entrypoint: Jsx.Entrypoint, env: Envelope.Envelope): Element => {
  const root = make(Jsx.clone(entrypoint.component));
  root._env = env;
  root.trie = step(root);
  root.step = step(root);
  root.children = fromJsxChildren(root, entrypoint.component.childs ?? entrypoint.component.childs);
  return root;
};

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
  (self.polymer as any) = Polymer.unmount(self.polymer);
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

export const differ = Differ.make({
  empty  : Patch.skip() as Patch.Patch<Element>,
  combine: (a, b) => b,
  diff   : (self: Element, that) => {
    if (self === that) {
      return Patch.skip();
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
  },
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
