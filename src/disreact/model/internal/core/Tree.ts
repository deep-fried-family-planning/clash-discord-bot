import {declareProto, fromProto} from '#disreact/util/proto.ts';
import type * as Equal from 'effect/Equal';
import * as Inspectable from 'effect/Inspectable';
import * as Pipeable from 'effect/Pipeable';

export interface Tree<A = any> extends Inspectable.Inspectable, Pipeable.Pipeable, Equal.Equal {
  key   : string;
  index : number;
  data  : A;
  root  : Tree<A>;
  parent: Tree<A> | undefined;
  nodes : Tree<A>[] | undefined;
}

const TreePrototype = declareProto<Tree>({
  key   : '0',
  index : 0,
  data  : undefined,
  root  : undefined as any,
  parent: undefined,
  nodes : undefined,
  ...Pipeable.Prototype,
  ...Inspectable.BaseProto,
  toJSON() {
    return {
      _id: 'Tree',
      key: this.key,
    };
  },
});

export const root = <A>(data: A): Tree<A> => {
  const self = fromProto(TreePrototype);
  self.root = self;
  self.data = data;
  return self;
};

export const node = <A>(parent: Tree<A>, data: A): Tree<A> => {
  const self = fromProto(TreePrototype);
  self.root = parent.root;
  self.parent = parent;
  self.data = data;
  self.key = `${parent.key}.0`;
  return self;
};

export const nodes = <A>(parent: Tree<A>, ds: A[]): Tree<A> => {
  const root = parent.root;
  const key = parent.key;
  const ns = Array(ds.length);
  const padding = Math.ceil(ds.length / 10);

  for (let i = 0; i < ds.length; i++) {
    const self = fromProto(TreePrototype);
    self.root = root;
    self.parent = parent;
    self.data = ds[i];
    self.key = `${key}.${`${i}`.padStart(padding, '0')}`;
    ns[i] = self;
  }
  parent.nodes = ns;
  return ns;
};
