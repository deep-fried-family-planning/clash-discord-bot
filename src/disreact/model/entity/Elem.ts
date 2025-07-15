import type * as Traversable from '#disreact/core/Traversable.ts';
import * as Core from '#disreact/model/core/core.ts';
import type * as Fn from '#disreact/model/core/Fn.ts';
import * as Patch from '#disreact/model/core/Patch.ts';
import * as Polymer from '#disreact/model/core/Polymer.ts';
import type * as Envelope from '#disreact/model/entity/Envelope.ts';
import * as Jsx from '#disreact/model/runtime/Jsx.ts';
import * as Differ from 'effect/Differ';
import type * as E from 'effect/Effect';
import * as Either from 'effect/Either';
import * as Equal from 'effect/Equal';
import * as Hash from 'effect/Hash';
import * as HashMap from 'effect/HashMap';
import * as Inspectable from 'effect/Inspectable';
import * as Pipeable from 'effect/Pipeable';

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
    return Inspectable.format({
      _id  : 'Props',
      value: this,
    });
  },
} as Props;

export const makeProps = (props: any): Props => {
  return Object.assign(
    Object.create(PropsProto),
    props,
  );
};

export const makeRestProps = (props: any): Props => {
  return makeProps(props);
};

export interface Elem extends Inspectable.Inspectable,
  Pipeable.Pipeable,
  Equal.Equal,
  Hash.Hash,
  Traversable.Meta,
  Traversable.Ancestor<Elem>,
  Traversable.Descendent<Elem>
{
  _tag      : typeof TEXT | typeof FRAGMENT | typeof INTRINSIC | typeof COMPONENT;
  _env      : Envelope.Envelope;
  key?      : string | undefined;
  component?: string | Fn.JsxFC | typeof Jsx.Fragment | undefined;
  props?    : Props | undefined;
  polymer?  : Polymer.Polymer;
  text?     : any;
  render?   : E.Effect<Jsx.Children> | undefined;
  rendered? : Elem[] | undefined;
}

const ElementPrototype: Elem = {
  _tag     : 'Intrinsic',
  _env     : undefined as any,
  component: undefined,
  key      : undefined,
  text     : undefined,
  ancestor : undefined,
  children : undefined,
  rendered : undefined,
  depth    : 0,
  index    : 0,
  height   : 0,
  valence  : 0,
  trie     : '',
  step     : '',
  ...Pipeable.Prototype,
  ...Inspectable.BaseProto,
  [Hash.symbol]() {
    return Hash.structure(this);
  },
  [Equal.symbol]() {
    throw new Error();
  },
  toJSON() {
    return Inspectable.format({
      _id     : 'Element',
      _tag    : this._tag,
      key     : this.key,
      props   : this.props,
      polymer : this.polymer,
      children: this.children,
    });
  },
};

export const TEXT      = 'Text',
             FRAGMENT  = 'Fragment',
             INTRINSIC = 'Intrinsic',
             COMPONENT = 'Component';

export interface Text extends Elem {
  _tag     : typeof TEXT;
  component: undefined;
  props    : undefined;
  text     : any;
}

export interface Fragment extends Elem {
  _tag     : typeof FRAGMENT;
  component: typeof Jsx.Fragment;
}

export interface Intrinsic extends Elem {
  _tag     : typeof INTRINSIC;
  component: string;
  props    : Props;
}

export interface Component extends Elem {
  _tag     : typeof COMPONENT;
  component: Fn.JsxFC;
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

export type Type = | Text
                   | Fragment
                   | Intrinsic
                   | Component;

export const isComponent = (self: Elem): self is Component =>
  self._tag === 'Component';

export const toEither = (self: Elem): Either.Either<Component, Elem> =>
  isComponent(self)
  ? Either.right(self)
  : Either.left(self);

const step = (self: Elem) => `${self.depth}:${self.index}`;
const stepId = (self: Elem) => `${step(self.ancestor!)}:${step(self)}`;
const trieId = (self: Elem) => `${self.ancestor!.trie}:${step(self)}`;
const keyId = (self: Elem) => self.key ?? self.trie;

const makeText = (text: any): Text => {
  const self = Object.create(TextProto) as Text;
  self.text = text;
  return self;
};

const make = (jsx?: Jsx.Child): Elem => {
  if (!jsx || typeof jsx !== 'object') {
    const self = Object.create(TextProto) as Text;
    self.text = jsx;
    return self;
  }
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
      self.component = jsx.type as Fn.JsxFC;
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

const fromJsxChild = (cur: Elem, c: Jsx.Child, index: number): Elem => {
  const child = make(c);
  child._env = cur._env;
  child.ancestor = cur;
  child.depth = cur.depth + 1;
  child.index = index;
  child.trie = trieId(child);
  child.step = stepId(child);
  child.children = fromJsxChildren(child, child.props?.children);
  return child;
};

export const fromJsxChildren = (cur: Elem, cs: Jsx.Children): Elem[] | undefined => {
  if (!cs) {
    return undefined;
  }
  if (!Array.isArray(cs)) {
    return [fromJsxChild(cur, cs as Jsx.Child, 0)];
  }
  const children = [] as Elem[];

  for (let i = 0; i < cs.length; i++) {
    const child = fromJsxChild(cur, cs[i], i);
    children[i] = child;
  }
  return children;
};

export const fromJsx = (jsx: Jsx.Jsx, env: Envelope.Envelope): Elem => {
  const root = Core.makeElement(Jsx.clone(jsx));
  root._env = env;
  root.trie = step(root);
  root.step = step(root);
  root.children = fromJsxChildren(root, jsx.childs ?? jsx.childs);
  return root;
};

export const fromJsxEntrypoint = (entrypoint: Jsx.Entrypoint, env: Envelope.Envelope): Elem => {
  const root = Core.makeElement(Jsx.clone(entrypoint.component));
  root._env = env;
  root.trie = step(root);
  root.step = step(root);
  root.children = fromJsxChildren(root, entrypoint.component.childs ?? entrypoint.component.childs);
  return root;
};

export const dispose = (self: Elem) => {
  (self._env as any) = undefined;
  (self.props as any) = undefined;
  (self.polymer as any) = undefined;
  self.ancestor = undefined;
  self.children = undefined;
};

export const diff = (self: Elem, that: Elem): Patch.Patch<Elem> => {
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

export const update = (self: Elem, that: Elem): Elem => {
  self.props = that.props;
  self.text = that.text;
  throw new Error();
};

export const replace = (self: Elem, at: number, that: Elem): Elem => {
  return self.children!.splice(at, 1, that)[0];
};

export const remove = (self: Elem, at: number, to: number): Elem[] => {
  return self.children!.splice(at, to - at);
};

export const insert = (self: Elem, at: number, that: Elem[]): Elem => {
  if (!self.children) {
    self.children = that;
    return self;
  }
  self.children.splice(at, 0, ...that);
  return self;
};

export const diffs = (self: Elem, that: Elem): Patch.Patches<Elem>[] => {
  throw new Error();
};

const childMap = (cs?: Elem[]) => {
  if (!cs) {
    return HashMap.empty();
  }
  return HashMap.make(...cs.map((child) => [(child.key ?? child.component) as string, child] as const));
};

const mapChild = (cs: HashMap.HashMap<string, Elem>) => {
  if (HashMap.isEmpty(cs)) {
    return undefined;
  }
  return HashMap.toValues(cs);
};

export const differ = Differ.make({
  empty  : Patch.skip() as Patch.Patch<Elem>,
  combine: (a, b) => b,
  diff   : (self: Elem, that) => {
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
