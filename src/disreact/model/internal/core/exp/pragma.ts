import type * as FC from '#src/disreact/model/internal/infrastructure/fc.ts';

export const TypeId   = Symbol.for('disreact/pragma'),
             jsxId    = Symbol.for('disreact/jsx'),
             jsxsId   = Symbol.for('disreact/jsxs'),
             jsxDEVId = Symbol.for('disreact/jsxDEV');

export type Primitive = | null
                        | undefined
                        | boolean
                        | number
                        | string
                        | symbol;

export type Children<A> = A | A[];

export interface Pragma<A, B, C extends Pragma<any, any> = any, D = Primitive> {
  [TypeId]   : typeof jsxId | typeof jsxsId;
  [jsxDEVId]?: typeof jsxDEVId | undefined;
  
  _tag : A;
  kind : B;
  props: {
    [key: string]: any;
    children?    : Children<C | D>;
  };
}

export const isPragma = (u: unknown): u is Pragma<any, any> =>
  typeof u === 'object'
  && u !== null
  && TypeId in u;

export const Prototype = {
  [TypeId]  : undefined,
  [jsxDEVId]: undefined,
  _tag      : undefined,
  kind      : undefined,
  props     : undefined,
};

export const REST = 'rest',
             FUNC = 'func';

export interface Rest extends Pragma<typeof REST, string, Rest | Func> {}

export interface Func extends Pragma<typeof FUNC, FC.Known, Rest | Func> {}
