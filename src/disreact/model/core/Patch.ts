import {declareProto, declareSubtype, fromProto} from '#disreact/util/proto.ts';
import * as Inspectable from 'effect/Inspectable';
import type * as Pipeable from 'effect/Pipeable';

export type Patch<A> =
  | Skip<A>
  | Update<A>
  | Replace<A>
  | Add<A>
  | Remove<A>;

export interface Skip<A> {
  _tag: 'Skip';
  self: A;
};

export interface Update<A> {
  _tag: 'Update';
  self: A;
  that: A;
};

export interface Replace<A> {
  _tag: 'Replace';
  self: A;
  that: A;
};

export interface Add<A> {
  _tag: 'Add';
  that: A;
};

export interface Remove<A> {
  _tag: 'Remove';
  self: A;
};

const Patch = declareProto<Patch<any>>({
  _tag: 'Skip' as any,
  self: undefined as any,
  that: undefined as any,
});

const Skip = declareSubtype<Skip<any>, Patch<any>>(Patch, {
  _tag: 'Skip',
});

const Update = declareSubtype<Update<any>, Patch<any>>(Patch, {
  _tag: 'Update',
});

const Replace = declareSubtype<Replace<any>, Patch<any>>(Patch, {
  _tag: 'Replace',
});

const Add = declareSubtype<Add<any>, Patch<any>>(Patch, {
  _tag: 'Add',
});

const Remove = declareSubtype<Remove<any>, Patch<any>>(Patch, {
  _tag: 'Remove',
});

export const skip = <A>(self: A): Skip<A> => {
  const patch = fromProto(Skip);
  patch.self = self;
  return patch;
};

export const update = <A>(self: A, that: A): Update<A> => {
  const patch = fromProto(Update);
  patch.self = self;
  patch.that = that;
  return patch;
};

export const replace = <A>(self: A, that: A): Replace<A> => {
  const patch = fromProto(Replace);
  patch.self = self;
  patch.that = that;
  return patch;
};

export const add = <A>(that: A): Add<A> => {
  const patch = fromProto(Add);
  patch.that = that;
  return patch;
};

export const remove = <A>(self: A): Remove<A> => {
  const patch = fromProto(Remove);
  patch.self = self;
  return patch;
};

export const release = (patch: Patch<any>) => {
  patch._tag = undefined as any;
  (patch as Replace<any>).self = undefined as any;
  (patch as Replace<any>).that = undefined as any;
};

export interface Changeset<A> extends Inspectable.Inspectable, Pipeable.Pipeable {
  _tag   : 'Changeset';
  target : A;
  latest : A[] | undefined;
  patches: Update<A>[];
  mount  : A[];
  unmount: A[];
  render : A[];
  changes: Changeset<A>[];
};

const Changeset = declareProto<Changeset<any>>({
  _tag   : 'Changeset',
  target : undefined as any,
  latest : undefined as any,
  patches: undefined as any,
  mount  : undefined as any,
  unmount: undefined as any,
  render : undefined as any,
  changes: undefined as any,
  ...Pipeable.Prototype,
  ...Inspectable.BaseProto,
  toJSON() {
    return {
      _id    : 'Changeset',
      self   : this.target,
      latest : this.latest?.length,
      mount  : this.mount?.length,
      unmount: this.unmount?.length,
      render : this.render?.length,
    };
  },
});

export const changeset = <A>(target: A, parent?: Changeset<A>): Changeset<A> => {
  const self = fromProto(Changeset);
  self.target = target;
  self.changes = [];

  if (!parent) {
    self.mount = [];
    self.unmount = [];
    self.render = [];
    return self;
  }
  self.mount = parent.mount;
  self.unmount = parent.unmount;
  self.render = parent.render;
  return self;
};

export const releaseChangeset = (self: Changeset<any>) => {
  self._tag = undefined as any;
  self.target = undefined as any;
  self.latest = undefined as any;
  self.patches = undefined as any;
  self.mount = undefined as any;
  self.unmount = undefined as any;
  self.render = undefined as any;
};
