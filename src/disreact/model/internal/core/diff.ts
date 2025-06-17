export const SKIP    = 1 as const,
             REPLACE = 2 as const,
             UPDATE  = 3 as const,
             INSERT  = 4 as const,
             REMOVE  = 5 as const,
             RENDER  = 6 as const,
             ADD     = 7 as const;

export type Skip = {
  _tag: typeof SKIP;
};

export type Add<A> = {
  _tag: typeof ADD;
  node: A;
};

export type Remove = {
  _tag: typeof REMOVE;
};

export type Insert<A> = {
  _tag: typeof INSERT;
  node: A;
};

export type Update<A> = {
  _tag: typeof UPDATE;
  node: A;
};

export type Replace<A> = {
  _tag: typeof REPLACE;
  node: A;
};

export type Render = {
  _tag: typeof RENDER;
};

export type Diff<A> = | Skip
                      | Add<A>
                      | Remove
                      | Insert<A>
                      | Update<A>
                      | Replace<A>
                      | Render;

export type Node<A> = | Skip
                      | Update<A>
                      | Replace<A>
                      | Render;

export type Nodes<A> = | Skip
                       | Add<A>
                       | Remove
                       | Insert<A>;

const SkipProto = {
  _tag: SKIP,
};

export const skip = (): Skip => SkipProto;

export const add = <A>(node: A): Add<A> =>
  ({
    _tag: ADD,
    node: node,
  });

const RemoveProto = {
  _tag: REMOVE,
};

export const remove = (): Remove => RemoveProto;

export const insert = <A>(node: A): Insert<A> =>
  ({
    _tag: INSERT,
    node: node,
  });

export const update = <A>(node: A): Update<A> =>
  ({
    _tag: UPDATE,
    node: node,
  });

export const replace = <A>(node: A): Replace<A> =>
  ({
    _tag: REPLACE,
    node: node,
  });

const RenderProto = {
  _tag: RENDER,
};

export const render = (): Render => RenderProto;
