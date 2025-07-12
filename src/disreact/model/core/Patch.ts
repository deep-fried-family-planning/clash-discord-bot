export type Skip = {
  _tag : 'Skip';
  cont?: boolean | undefined;
};

export type Update<A> = {
  _tag : 'Update';
  that : A;
  cont?: boolean | undefined;
};

export type Replace<A> = {
  _tag: 'Replace';
  that: A;
};

export type Insert<A> = {
  _tag : 'Insert';
  at   : number;
  these: A[];
};

export type Remove<A> = {
  _tag : 'Remove';
  at   : number;
  these: number;
};

export type Patch<A> = | Skip
                       | Update<A>
                       | Replace<A>;

export type Patches<A> = | Skip
                         | Update<A>
                         | Replace<A>
                         | Insert<A>
                         | Remove<A>;

const Proto: Patch<any> | Patches<any> = {
  _tag : 'Skip',
  that : undefined,
  at   : undefined,
  these: undefined,
  cont : undefined,
} as Patch<any> | Patches<any>;

export const skip = (cont?: boolean): Skip => {
  if (!cont) {
    return Proto as Skip;
  }
  const patch = Object.create(Proto) as Skip;
  patch.cont = cont;
  return patch;
};

export const update = <A>(that: A, cont?: boolean): Update<A> => {
  const patch = Object.create(Proto) as Update<A>;
  patch._tag = 'Update';
  patch.that = that;
  patch.cont = cont;
  return patch;
};

export const replace = <A>(that: A): Replace<A> => {
  const patch = Object.create(Proto) as Replace<A>;
  patch._tag = 'Replace';
  patch.that = that;
  return patch;
};

export const insert = <A>(at: number, these: A[]): Insert<A> => {
  const patch = Object.create(Proto) as Insert<A>;
  patch._tag = 'Insert';
  patch.at = at;
  patch.these = these;
  return patch;
};

export const remove = <A>(at: number, these: number): Remove<A> => {
  const patch = Object.create(Proto) as Remove<A>;
  patch._tag = 'Remove';
  patch.at = at;
  patch.these = these;
  return patch;
};
