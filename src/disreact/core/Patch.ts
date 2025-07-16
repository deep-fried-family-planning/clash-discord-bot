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

const Proto: Patch<any> = {
  _tag : 'Skip',
  that : undefined,
  at   : undefined,
  these: undefined,
  and  : undefined,
  then : undefined,
} as Patch<any>;

export type Empty = {
  _tag: 'Empty';
};

const EmptyProto: Empty = Object.assign(Object.create(Proto), {
  _tag: 'Empty',
});

export const empty = (): Empty => EmptyProto;

export type Skip = {
  _tag: 'Skip';
};

const SkipProto: Skip = Object.assign(Object.create(Proto), {
  _tag: 'Skip',
});

export const skip = (): Skip => SkipProto;

export type AndThen<A> = {
  _tag: 'AndThen';
  and : A;
  then: A;
};

const AndThenProto: AndThen<any> = Object.assign(Object.create(Proto), {
  _tag: 'AndThen',
});

export const andThen = <A extends Patch<any>>(and: A, then: A): AndThen<A> => {
  const patch = Object.create(AndThenProto) as AndThen<A>;
  patch.and = and;
  patch.then = then;
  return patch;
};

export type Update<A> = {
  _tag: 'Update';
  self: A;
  that: A;
};

const UpdateProto: Update<any> = Object.assign(Object.create(Proto), {
  _tag: 'Update',
});

export const update = <A>(self: A, that: A): Update<A> => {
  const patch = Object.create(UpdateProto) as Update<A>;
  patch.self = self;
  patch.that = that;
  return patch;
};

export type Replace<A> = {
  _tag: 'Replace';
  self: A;
  that: A;
};

const ReplaceProto: Replace<any> = Object.assign(Object.create(Proto), {
  _tag: 'Replace',
});

export const replace = <A>(self: A, that: A): Replace<A> => {
  const patch = Object.create(ReplaceProto) as Replace<A>;
  patch.self = self;
  patch.that = that;
  return patch;
};

export type Insert<A> = {
  _tag : 'Insert';
  at   : number;
  these: A[];
};

const InsertProto: Insert<any> = Object.assign(Object.create(Proto), {
  _tag: 'Insert',
});

export const insert = <A>(at: number, these: A[]): Insert<A> => {
  const patch = Object.create(InsertProto) as Insert<A>;
  patch.at = at;
  patch.these = these;
  return patch;
};

export type Remove<A> = {
  _tag : 'Remove';
  at   : number;
  these: number;
};

const RemoveProto: Remove<any> = Object.assign(Object.create(Proto), {
  _tag: 'Remove',
});

export const remove = <A>(at: number, these: number): Remove<A> => {
  const patch = Object.create(RemoveProto) as Remove<A>;
  patch.at = at;
  patch.these = these;
  return patch;
};

export type Mount<A> = {
  _tag: 'Mount';
  that: A;
};

const MountProto: Mount<any> = Object.assign(Object.create(Proto), {
  _tag: 'Mount',
});

export const mount = <A>(that: A): Mount<A> => {
  const patch = Object.create(MountProto) as Mount<A>;
  patch.that = that;
  return patch;
};

export type Render<A> = {
  _tag: 'Render';
  that: A;
};

const RenderProto: Render<any> = Object.assign(Object.create(Proto), {
  _tag: 'Render',
});

export const render = <A>(that: A): Render<A> => {
  const patch = Object.create(RenderProto) as Render<A>;
  patch.that = that;
  return patch;
};

export type Unmount<A> = {
  _tag: 'Unmount';
  that: A;
};

const UnmountProto: Unmount<any> = Object.assign(Object.create(Proto), {
  _tag: 'Unmount',
});

export const unmount = <A>(that: A): Unmount<A> => {
  const patch = Object.create(UnmountProto) as Unmount<A>;
  patch.that = that;
  return patch;
};
