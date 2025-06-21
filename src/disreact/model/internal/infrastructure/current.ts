import type * as Element from '#src/disreact/model/adaptor/exp/domain/old/element.ts';
import type * as Rehydrant from '#src/disreact/model/adaptor/exp/domain/old/envelope.ts';
import type * as Polymer from '#src/disreact/model/internal/domain/polymer.ts';
import type * as Stack from '#src/disreact/model/internal/stack.ts';

export let component = undefined as undefined | Element.Func,
           env       = undefined as undefined | Rehydrant.Envelope,
           poly      = undefined as undefined | Polymer.Polymer,
           stack     = undefined as undefined | Stack.Stack;

export type Current = {
  node?: Element.Func;
  root?: Rehydrant.Envelope;
  poly?: Polymer.Polymer;
};

let current = undefined as undefined | Current;

export const get = (): Required<Current> => {
  if (!component || !env || !poly) {
    throw new Error('Hooks must be called within a component.');
  }

  if (!current) {
    throw new Error('Hooks must be called within a component.');
  }

  return {
    node : component,
    root : env,
    poly : poly,
    stack: stack,
  } as Required<Current>;
};

export const set = (rh: Rehydrant.Envelope, el: Element.Func) => {
  current = undefined;
  env = rh;
  component = el;
  poly = el.polymer!;
};

export const reset = (_id?: number) => {
  env = undefined;
  component = undefined;
  poly = undefined;
  stack = undefined;
};
