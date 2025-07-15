import type * as Traversable from '#disreact/core/Traversable.ts';
import * as Core from '#disreact/model/core/core.ts';
import * as Fn from '#disreact/model/core/Fn.ts';
import * as Patch from '#disreact/model/core/Patch.ts';
import * as Polymer from '#disreact/model/core/Polymer.ts';
import type * as Envelope from '#disreact/model/Envelope.ts';
import * as Hooks from '#disreact/model/runtime/Hooks.ts';
import * as Jsx from '#disreact/model/runtime/Jsx.ts';
import * as Differ from 'effect/Differ';
import * as E from 'effect/Effect';
import * as Either from 'effect/Either';
import * as Equal from 'effect/Equal';
import {globalValue} from 'effect/GlobalValue';
import type * as Hash from 'effect/Hash';
import * as HashMap from 'effect/HashMap';
import type * as Inspectable from 'effect/Inspectable';
import type * as Pipeable from 'effect/Pipeable';

export const TEXT      = 'Text',
             FRAGMENT  = 'Fragment',
             INTRINSIC = 'Intrinsic',
             COMPONENT = 'Component';

export type Type = | Text
                   | Fragment
                   | Intrinsic
                   | Component;

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

const fromJsxChild = (cur: Elem, c: Jsx.Child, index = 0): Elem => {
  if (!c || typeof c !== 'object') {
    const child = Core.makeTextElement(c);
    child._env = cur._env;
    child.ancestor = cur;
    child.depth = cur.depth + 1;
    child.index = index;
    child.step = stepId(child);
    child.trie = trieId(child);
    return child;
  }
  const child = Core.makeElement(Jsx.clone(c));
  child._env = cur._env;
  child.ancestor = cur;
  child.depth = cur.depth + 1;
  child.index = index;
  child.trie = trieId(child);
  child.step = stepId(child);
  child.children = fromJsxChildren(child, c.childs ?? c.childs);
  return child;
};

const fromJsxChildren = (cur: Elem, cs: Jsx.Children): Elem[] | undefined => {
  if (!cs) {
    return undefined;
  }
  if (!Array.isArray(cs)) {
    return [fromJsxChild(cur, cs as Jsx.Child)];
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

const GlobalMutex = globalValue(Symbol.for('disreact/GlobalMutex'), () => E.unsafeMakeSemaphore(1));
const GlobalAcquire = GlobalMutex.take(1);
const GlobalRelease = GlobalMutex.release(1);

export const renderGlobal = (self: Elem) => {
  const elem = self as Component;
  const component = elem.component;
  const polymer = elem.polymer;

  if (!component._state) {
    return Fn.normalizePropsFC(component, self.props).pipe(
      E.map((children) => {
        Polymer.commit(polymer);

        if (Polymer.isStateless(polymer!)) {
          component._state = false;
        }
        self.rendered = fromJsxChildren(self, children);
        return self;
      }),
    );
  }

  return GlobalAcquire.pipe(
    E.flatMap(() => {
      Hooks.active.polymer = polymer;
      return Fn.normalizePropsFC(component, self.props);
    }),
    E.tap(() => {
      Hooks.active.polymer = undefined;
      return GlobalRelease;
    }),
    E.map((children) => {
      Polymer.commit(polymer);

      if (Polymer.isStateless(polymer!)) {
        component._state = false;
      }
      self.rendered = fromJsxChildren(self, children);
      return self;
    }),
    E.tapDefect(() => GlobalRelease),
  );
};

export const renderLocal = (self: Elem) =>
  renderGlobal(self);

export const acceptRender = (self: Elem) => {
  self.children = self.rendered;
  self.rendered = undefined;
  return self.children;
};

export const flush = (self: Elem) => {
  const polymer = self.polymer!;

  return E.whileLoop({
    while: () => polymer.queue.length > 0,
    step : () => {},
    body : () => {
      const fx = polymer.queue.shift()!;

      return Fn.normalizeEffector(fx.effector);
    },
  });
};

export const initialize = (self: Component) => {
  self.polymer = Polymer.make(self);
  return renderGlobal(self).pipe();
};

export const invoke = (self: Elem) => {

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
