import * as proto from '#src/disreact/model/internal/infrastructure/proto.ts';

export const SKIP    = 0,
             UPDATE  = 1,
             REPLACE = 2;

export type Skip = {
  _tag: typeof SKIP;
};

export type Update<A> = {
  _tag: typeof UPDATE;
  node: A;
};

export type Replace<A> = {
  _tag: typeof REPLACE;
  node: A;
};

export type Diff<A> = | Skip
                      | Update<A>
                      | Replace<A>;

const Skip = proto.type<Skip>({
  _tag: SKIP,
});

const Update = proto.type<Update<any>>({
  _tag: UPDATE,
});

const Replace = proto.type<Replace<any>>({
  _tag: REPLACE,
});

export const skip = (): Skip => Skip;

export const update = <A>(node: A): Update<A> =>
  proto.init(Update, {
    node: node,
  });

export const replace = <A>(node: A): Replace<A> =>
  proto.init(Replace, {
    node: node,
  });
