import type {Element} from '#src/disreact/codec/dsx/index.ts';
import {S} from '#src/internal/pure/effect.ts';
import {Data, Equal} from 'effect';



export const T = S.Struct({
  component: S.optional(S.mutable(S.Any)),
  pc       : S.Number,
  stack    : S.mutable(S.Array(S.Any)),
  prior    : S.mutable(S.Array(S.Any)),
  rc       : S.Number,
  queue    : S.mutable(S.Array(S.Any)),
});

const t = S.mutable(T);

export type T =
  S.Schema.Type<typeof t>
  & {
    component?: Element.Function.T | undefined;
  };

export type TRecord = { [K in string]: T };

export const make = (): T => ({
  pc   : 0,
  stack: [],
  prior: [],
  rc   : 0,
  queue: [],
});

export const link = (element: Element.Function.T) => {
  element.fiber.component = element;
  return element;
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
