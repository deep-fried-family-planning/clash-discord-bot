import {StructProto} from '#disreact/core/constants.ts';

export type Chain<A> = | A
                       | AndThen<A>;

export type Patch<A> = | Any<A>
                       | AndThen<Any<A>>;

type Any<A> = | Empty
              | Skip
              | Update<A>
              | Replace<A>
              | Insert<A>
              | Remove<A>
              | Mount<A>
              | Render<A>
              | Unmount<A>;

export type Empty = {
  _tag: 'Empty';
};

export type Skip = {
  _tag: 'Skip';
};

export type AndThen<A> = {
  _tag: 'AndThen';
  and : A | AndThen<A>;
  then: A | AndThen<A>;
};

export type Update<A> = {
  _tag: 'Update';
  self: A;
  that: A;
};

export type Replace<A> = {
  _tag: 'Replace';
  self: A;
  that: A;
};

export type Insert<A> = {
  _tag : 'Insert';
  at   : number;
  these: A[];
};

export type Move<A> = {
  _tag: 'Move';
  from: number;
  to  : number;
};

export type Remove<A> = {
  _tag : 'Remove';
  at   : number;
  these: number;
};

export type Mount<A> = {
  _tag: 'Mount';
  that: A;
};

export type Render<A> = {
  _tag: 'Render';
  that: A;
};

export type Unmount<A> = {
  _tag: 'Unmount';
  that: A;
};

const Proto: Patch<any> = {
  _tag : 'Skip',
  that : undefined,
  at   : undefined,
  these: undefined,
  and  : undefined,
  then : undefined,
  ...StructProto,
} as Patch<any>;

const EmptyProto: Empty = Object.assign(Object.create(Proto), {
  _tag: 'Empty',
});

const SkipProto: Skip = Object.assign(Object.create(Proto), {
  _tag: 'Skip',
});

const AndThenProto: AndThen<any> = Object.assign(Object.create(Proto), {
  _tag: 'AndThen',
});

const UpdateProto: Update<any> = Object.assign(Object.create(Proto), {
  _tag: 'Update',
});

const ReplaceProto: Replace<any> = Object.assign(Object.create(Proto), {
  _tag: 'Replace',
});

const InsertProto: Insert<any> = Object.assign(Object.create(Proto), {
  _tag: 'Insert',
});

const RemoveProto: Remove<any> = Object.assign(Object.create(Proto), {
  _tag: 'Remove',
});

const MountProto: Mount<any> = Object.assign(Object.create(Proto), {
  _tag: 'Mount',
});

const RenderProto: Render<any> = Object.assign(Object.create(Proto), {
  _tag: 'Render',
});

const UnmountProto: Unmount<any> = Object.assign(Object.create(Proto), {
  _tag: 'Unmount',
});

export const empty = (): Empty => EmptyProto;

export const skip = (): Skip => SkipProto;

export const andThen = <A, B>(and: A, then: B): AndThen<A | B> => {
  const patch = Object.create(AndThenProto) as AndThen<A | B>;
  patch.and = and;
  patch.then = then;
  return patch;
};

export const update = <A>(self: A, that: A): Update<A> => {
  const patch = Object.create(UpdateProto) as Update<A>;
  patch.self = self;
  patch.that = that;
  return patch;
};

export const replace = <A>(self: A, that: A): Replace<A> => {
  const patch = Object.create(ReplaceProto) as Replace<A>;
  patch.self = self;
  patch.that = that;
  return patch;
};

export const insert = <A>(at: number, these: A[]): Insert<A> => {
  const patch = Object.create(InsertProto) as Insert<A>;
  patch.at = at;
  patch.these = these;
  return patch;
};

export const remove = <A>(at: number, these: number): Remove<A> => {
  const patch = Object.create(RemoveProto) as Remove<A>;
  patch.at = at;
  patch.these = these;
  return patch;
};

export const mount = <A>(that: A): Mount<A> => {
  const patch = Object.create(MountProto) as Mount<A>;
  patch.that = that;
  return patch;
};

export const render = <A>(that: A): Render<A> => {
  const patch = Object.create(RenderProto) as Render<A>;
  patch.that = that;
  return patch;
};

export const unmount = <A>(that: A): Unmount<A> => {
  const patch = Object.create(UnmountProto) as Unmount<A>;
  patch.that = that;
  return patch;
};
