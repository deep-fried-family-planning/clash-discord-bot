import * as Patch from '#disreact/model/core/Patch.ts';
import * as Polymer from '#disreact/model/core/Polymer.ts';
import type * as Traversable from '#disreact/model/core/Traversable.ts';
import * as Jsx from '#disreact/model/Jsx.ts';
import * as Equal from 'effect/Equal';
import * as Differ from 'effect/Differ';
import type * as E from 'effect/Effect';
import * as HashMap from 'effect/HashMap';
import * as Inspectable from 'effect/Inspectable';
import * as Pipeable from 'effect/Pipeable';

export type Type = any;

export interface Elem extends Inspectable.Inspectable,
  Pipeable.Pipeable,
  Traversable.Ancestor<Elem>,
  Traversable.Descendent<Elem>
{
  _apex: {
    entrypoint: Jsx.Entrypoint;
    root      : Elem;
    roots     : Elem[];
    flags     : Set<Elem>;
    mount     : Set<Elem>;
    update    : Set<Elem>;
    dismount  : Set<Elem>;
  };
  key?      : string | undefined;
  component?: string | any | undefined;
  props?    : any;
  polymer?  : Polymer.Polymer;
  text?     : any;
  depth     : number;
  idx       : number;
  id        : string;
  render?   : E.Effect<Jsx.Children> | undefined;
}

const makeKey = (self: Elem) =>
  self.key ? self.key :
  self.id;

const Proto: Elem = {
  _apex    : undefined as any,
  component: undefined,
  key      : undefined,
  text     : undefined,
  ancestor : undefined,
  children : undefined,
  ...Pipeable.Prototype,
  ...Inspectable.BaseProto,
  toJSON() {
    return Inspectable.format({
      _id: 'Elem',
    });
  },
};

const connect = (self: Elem, that: Elem) => {

};

export const fromJsx = (self: Elem, jsx: Jsx.Jsx): Elem => {
  const elem = Object.create(Proto) as Elem;
  elem._apex = self._apex;
  elem.key = jsx.key;
  elem.component = jsx.type;
  elem.props = jsx.props;
  elem.ancestor = self;
  elem.depth = self.depth + 1;

  elem.children = jsx.child ? [fromJsxChild(elem, jsx.child)] :
                  jsx.childs ? fromJsxChilds(elem, jsx.childs) :
                  undefined;

  return elem;
};

export const fromJsxChild = (self: Elem, child: Jsx.Child): Elem => {
  if (Jsx.isValue(child)) {
    const elem = Object.create(Proto) as Elem;
    elem._apex = self._apex;
    elem.text = child;
    return elem;
  }
  return fromJsx(self, child);
};

export const fromJsxChilds = (self: Elem, childs: Jsx.Child[]): Elem[] => {
  return childs.map((child, idx) => {
    const elem = fromJsxChild(self, child);
    elem.idx = idx;
    return elem;
  });
};

export const fromJsxChildren = (self: Elem, children: Jsx.Children): Elem[] => {
  if (Array.isArray(children)) {
    return fromJsxChilds(self, children);
  }
  return [fromJsxChild(self, children)];
};

export const fromEntrypoint = (entrypoint: Jsx.Entrypoint, props: any): Elem => {
  const self = Object.create(Proto) as Elem;
  self._apex = {
    entrypoint,
    root : self,
    roots: [],
    flags: new Set(),
  };
  self.key = entrypoint.component.key;
  self.component = entrypoint.component.type;
  self.props = props;

  self.children = entrypoint.component.child ? [fromJsxChild(self, entrypoint.component.child)] :
                  entrypoint.component.childs ? fromJsxChilds(self, entrypoint.component.childs) :
                  undefined;

  return self;
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

export const diff = (self: Elem, that: Elem): Patch.Patch<Elem> => {
  throw new Error();
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
        if (self.polymer) {
          self._apex.update.add(self);
        }
        return self;
      }
      case 'Replace': {
        self._apex.dismount.add(self);
        self._apex.mount.add(patch.that);
        return patch.that;
      }
    }
  },
});

export const differs = Differ.readonlyArray(differ);

const thing = Differ.zip(
  differ,
  differs,
);
