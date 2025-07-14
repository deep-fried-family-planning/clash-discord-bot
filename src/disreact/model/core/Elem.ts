import type * as Traversable from '#disreact/core/Traversable.ts';
import type * as Fn from '#disreact/model/core/Fn.ts';
import * as Internal from '#disreact/model/core/internal.ts';
import * as Patch from '#disreact/model/core/Patch.ts';
import * as Polymer from '#disreact/model/core/Polymer.ts';
import type * as Envelope from '#disreact/model/core/Envelope.ts';
import * as Jsx from '#disreact/model/Jsx.ts';
import * as Differ from 'effect/Differ';
import type * as E from 'effect/Effect';
import * as Equal from 'effect/Equal';
import type * as Hash from 'effect/Hash';
import * as HashMap from 'effect/HashMap';
import type * as Inspectable from 'effect/Inspectable';
import type * as Pipeable from 'effect/Pipeable';

export interface Props extends Inspectable.Inspectable, Equal.Equal, Hash.Hash,
  Record<'onclick' | 'onselect' | 'onsubmit', any>,
  Record<string, any>
{
  readonly children?: Jsx.Children;
}

export interface Elem extends Inspectable.Inspectable, Pipeable.Pipeable, Equal.Equal, Hash.Hash,
  Traversable.Meta,
  Traversable.Ancestor<Elem>,
  Traversable.Descendent<Elem>
{
  _env      : Envelope.Envelope;
  key?      : string | undefined;
  component?: string | Fn.JsxFC | typeof Jsx.Fragment | undefined;
  props?    : Props | undefined;
  polymer?  : Polymer.Polymer;
  text?     : any;
  render?   : E.Effect<Jsx.Children> | undefined;
}

const fromJsxChild = (cur: Elem, c: Jsx.Child): Elem => {
  if (Jsx.isValue(c)) {
    const child = Internal.makeTextElement(c);
    child._env = cur._env;
    child.ancestor = cur;
    child.depth = cur.depth + 1;
    return child;
  }
  const child = Internal.makeElement(Jsx.clone(c));
  child._env = cur._env;
  child.ancestor = cur;
  child.depth = cur.depth + 1;
  child.children = fromJsxChildren(child, c.childs ?? c.childs);
  return child;
};

export const fromJsxChildren = (cur: Elem, cs: Jsx.Children): Elem[] | undefined => {
  if (!cs) {
    return undefined;
  }
  if (!Array.isArray(cs)) {
    return [fromJsxChild(cur, cs)];
  }
  const children = [] as Elem[];

  for (let i = 0; i < cs.length; i++) {
    const child = fromJsxChild(cur, cs[i]);
    child.index = i;
    children[i] = child;
  }
  return children;
};

export const fromJsx = (jsx: Jsx.Jsx, env: Envelope.Envelope): Elem => {
  const root = Internal.makeElement(Jsx.clone(jsx));
  root._env = env;
  root.children = fromJsxChildren(root, jsx.childs ?? jsx.childs);
  return root;
};

export const fromJsxEntrypoint = (entrypoint: Jsx.Entrypoint, env: Envelope.Envelope): Elem => {
  const root = Internal.makeElement(Jsx.clone(entrypoint.component));
  root._env = env;
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
