import type * as FC from '#src/disreact/model/internal/infrastructure/fc.ts';

export type Primitive = | null
                        | undefined
                        | boolean
                        | number
                        | string
                        | symbol;

export const TypeId = Symbol.for('disreact/pragma'),
             jsxId  = Symbol.for('disreact/jsx'),
             jsxsId = Symbol.for('disreact/jsxs'),
             devId  = Symbol.for('disreact/jsxDEV');

interface Base {
  [TypeId]: typeof jsxId | typeof jsxsId;
  [devId]?: typeof devId | undefined;
  _tag    : any;
  kind    : any;
  props: {
    [key: string]: any;
  };
}

interface Jsx<A> extends Base {
  [TypeId]: typeof jsxId;
  props: {
    children?: Child<A>;
  };
}

interface Jsxs<A> extends Base {
  [TypeId]: typeof jsxsId;
  props: {
    children: Child<A>[];
  };
}

type Node<A> = | Jsx<A>
               | Jsxs<A>;

type Child<A> = | Primitive
                | Node<A>;

export type Pragma<A> = | Child<A>
                        | Child<A>[];

export const isPrimitive = <A>(u: Pragma<A>): u is Primitive =>
  typeof u !== 'object'
  || u === null;

export const isNode = <A>(u: Exclude<Pragma<A>, Primitive>): u is Node<A> =>
  TypeId in u;
  
export const isJsx = <A>(u: Node<A>): u is Jsx<A> =>
  u[TypeId] === jsxId;

export const isJsxs = <A>(u: Node<A>): u is Jsxs<A> =>
  u[TypeId] === jsxsId;

export const isPragma = (u: unknown): u is Pragma<any, any> =>
  typeof u === 'object'
  && u !== null
  && TypeId in u;

export const Prototype = {
  [TypeId]: undefined,
  [devId] : undefined,
  _tag    : undefined,
  kind    : undefined,
  props   : undefined,
};

export const REST = 'rest',
             FUNC = 'func';

export interface Rest extends Pragma<typeof REST, string, Rest | Func> {}

export interface Func extends Pragma<typeof FUNC, FC.Known, Rest | Func> {}
