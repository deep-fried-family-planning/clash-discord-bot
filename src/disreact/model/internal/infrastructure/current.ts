import type * as Component from '#src/disreact/model/internal/core/domain/old/component.ts';
import type * as Element from '#src/disreact/model/internal/core/domain/old/element.ts';
import type * as Polymer from '#src/disreact/model/internal/polymer.ts';
import type * as Rehydrant from '#src/disreact/model/internal/core/domain/old/envelope.ts';
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

export const get = (): Required<Current> => {
  if (!component || !env || !poly) {
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

export const parents = new WeakMap<any, Element.Func>();

export const origins = new WeakMap<any, any>();

export const registerOrigin = (self: any, dep: any) => {
  origins.set(self, dep);
};

export const getOrigin = <A>(self: any): A | undefined =>
  origins.get(self);
