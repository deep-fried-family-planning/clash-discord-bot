/* eslint-disable @typescript-eslint/no-unsafe-function-type */

export const TypeId = Symbol.for('disreact/fc');

export const SYNC   = 1,
             ASYNC  = 2,
             EFFECT = 3;

export interface FC<P> extends Function {
  (props: P): any;
}
