import * as proto from '#src/disreact/core/primitives/proto.ts';

export const SKIP    = 0,
             UPDATE  = 1,
             REPLACE = 2,
             CONT    = 3,
             RENDER = 4;

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

export type Cont<A> = {
  _tag   : typeof CONT;
  node   : A;
  render?: boolean | undefined;
};

export type Render = {
  _tag : typeof RENDER;
  props: any;
};

export type Diff<A> = | Skip
                      | Update<A>
                      | Replace<A>
                      | Cont<A>
| Render;

const Skip = proto.type<Skip>({
  _tag: SKIP,
});

const Update = proto.type<Update<any>>({
  _tag: UPDATE,
});

const Replace = proto.type<Replace<any>>({
  _tag: REPLACE,
});

const Cont = proto.type<Cont<any>>({
  _tag: CONT,
});

const Render = proto.type<Render>({
  _tag: RENDER,
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

export const cont = <A>(node: A, render?: boolean): Cont<A> =>
  proto.init(Cont, {
    node  : node,
    render: render,
  });

export const render = (props: any): Render =>
  proto.init(Render, {
    props: props,
  });
