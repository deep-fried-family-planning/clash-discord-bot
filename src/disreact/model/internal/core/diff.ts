import * as Prototype from '#src/disreact/model/internal/infrastructure/prototype.ts';
import type {Add} from 'effect/FiberRefsPatch';

export const SKIP     = 1 as const,
             CONT     = 2 as const,
             UPDATE   = 3 as const,
             REPLACE  = 4 as const,
             RENDER   = 5 as const,
             PREPEND  = 6 as const,
             APPEND   = 7 as const,
             INSERT   = 8 as const,
             REMOVE   = 9 as const,
             AND_THEN = 10 as const;

export type AndThen = {
  _tag  : typeof AND_THEN;
  first : Diff<any>;
  second: Diff<any>;
};

export const andThen = (first: Diff<any>, second: Diff<any>): AndThen =>
  ({
    _tag  : AND_THEN,
    first : first,
    second: second,
  });

export type Skip = {
  _tag: typeof SKIP;
};

export type Cont = {
  _tag: typeof CONT;
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
  _tag : typeof REMOVE;
  nodes: A[];
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
                      | Render
                      | AndThen;

export type Nodes<A> = | Skip
                       | Prepend<A>
                       | Append<A>
                       | Insert<A>
                       | Remove<A>;

const Skip = Prototype.declare<Skip>({
  _tag: SKIP,
});

const Update = Prototype.declare<Update<any>>({
  _tag: UPDATE,
});

const Replace = Prototype.declare<Replace<any>>({
  _tag: REPLACE,
});

const RenderProto = Prototype.declare<Render>({
  _tag: RENDER,
});

const Remove = Prototype.declare<Remove>({
  _tag: REMOVE,
});

const Insert = Prototype.declare<Insert<any>>({
  _tag: INSERT,
});

export const skip = (): Skip => Skip;

// export const add = <A>(node: A): Add<A> =>
//   Prototype.instance(Add, {
//     node: node,
//   });

export const remove = (): Remove => Remove;

export const insert = <A>(node: A): Insert<A> =>
  Prototype.instance(Insert, {
    node: node,
  });

export const update = <A>(node: A): Update<A> =>
  Prototype.instance(Update, {
    node: node,
  });

export const replace = <A>(node: A): Replace<A> =>
  Prototype.instance(Replace, {
    node: node,
  });

export const render = (): Render => RenderProto;
