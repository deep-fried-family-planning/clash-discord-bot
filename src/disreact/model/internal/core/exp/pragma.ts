/* eslint-disable @typescript-eslint/no-unsafe-function-type */

export const TypeId = Symbol.for('disreact/pragma'),
             JsxId  = Symbol.for('disreact/jsx'),
             JsxsId = Symbol.for('disreact/jsxs'),
             DevId  = Symbol.for('disreact/jsxDEV');

export type TypeId = typeof TypeId;

export type Primitive =
  | null
  | undefined
  | boolean
  | number
  | string
  | symbol;

type Child<A> = | Primitive
                | A;

export interface Base {
  [TypeId]: typeof JsxId | typeof JsxsId;
  [DevId]?: typeof DevId | undefined;
  _tag    : any;
  kind    : any;
  props   : {[key: string]: any};
}

export interface Jsx<
  T extends string | number = string | number,
  K extends string | Function = string | Function,
  J extends Base[TypeId] = Base[TypeId],
  C = Primitive,
> extends Base
{
  [TypeId]: J;
  _tag    : T;
  kind    : K;
  props:
    J extends typeof JsxId
    ? {children?: Primitive | C | undefined}
    : {children: (Primitive | C)[]};
}

export const isNotPrimitive = (u: unknown): u is Jsx =>

export const Prototype = {
  [TypeId]: undefined,
  [DevId] : undefined,
  _tag    : undefined,
  kind    : undefined,
  props   : undefined,
};
