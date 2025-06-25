import * as proto from '#src/disreact/model/internal/infrastructure/proto.ts';

export const SKIP    = 0,
             PREPEND = 1,
             APPEND  = 2,
             INSERT  = 3,
             REMOVE  = 4;

export type Skip = {
  _tag: typeof SKIP;
};

export type Prepend<A> = {
  _tag : typeof PREPEND;
  nodes: A[];
};

export type Append<A> = {
  _tag : typeof APPEND;
  nodes: A[];
};

export type Insert<A> = {
  _tag: typeof INSERT;
  node: A;
};

export type Remove<A> = {
  _tag: typeof REMOVE;
  node: A;
};

export type Diffs<A> = | Skip
                       | Prepend<A>
                       | Append<A>
                       | Insert<A>
                       | Remove<A>;

const SkipPrototype = proto.type<Skip>({
  _tag: SKIP,
});

const PrependPrototype = proto.type<Prepend<any>>({
  _tag: PREPEND,
});

const AppendPrototype = proto.type<Append<any>>({
  _tag: APPEND,
});

const InsertPrototype = proto.type<Insert<any>>({
  _tag: INSERT,
});

const RemovePrototype = proto.type<Remove<any>>({
  _tag: REMOVE,
});

export const skip = (): Skip => SkipPrototype;

export const prepend = <A>(nodes: A[]): Prepend<A> =>
  proto.init(PrependPrototype, {
    nodes: nodes,
  });

export const append = <A>(nodes: A[]): Append<A> =>
  proto.init(AppendPrototype, {
    nodes: nodes,
  });

export const insert = <A>(node: A): Insert<A> =>
  proto.init(InsertPrototype, {
    node: node,
  });

export const remove = <A>(node: A): Remove<A> =>
  proto.init(RemovePrototype, {
    node: node,
  });
