import {Data, Equal} from 'effect';
import type {Schema} from 'effect/Schema';
import {Any, Array, mutable, Number, optional, Struct} from 'effect/Schema';
import type * as FunctionElement from '#src/disreact/codec/dsx/function.ts';



export const T = Struct({
  component: optional(mutable(Any)),
  pc       : Number,
  stack    : mutable(Array(Any)),
  prior    : mutable(Array(Any)),
  rc       : Number,
  queue    : mutable(Array(Any)),
}).pipe(mutable);

export type T = Schema.Type<typeof T> & {
  component?: FunctionElement.T | undefined;
  pc        : number;
  stack     : any[];
  prior     : any[];
  rc        : number;
  queue     : any[];
};

export type Rec = { [K in string]: T };

export const make = (): T => ({
  pc   : 0,
  stack: [],
  prior: [],
  rc   : 0,
  queue: [],
});

export const link = (fn: FunctionElement.T) => {
  fn.fiber.component = fn;

  return fn;
};

export const savePrior = (node: T): T => {
  node.prior = structuredClone(node.stack);

  return node;
};

export const isSameState = (node: T): boolean => {
  const stackData = Data.array(node.stack.map((s) => Data.struct(s)));
  const priorData = Data.array(node.prior.map((s) => Data.struct(s)));

  return Equal.equals(stackData, priorData);
};
