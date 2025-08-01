import type * as Element from '#disreact/core/a/adaptor/element.ts';
import type * as Rehydrant from '#disreact/core/a/adaptor/envelope.ts';
import type * as Document from '#disreact/core/behaviors/exp/documentold.ts';
import type * as Polymer from '#disreact/core/internal/polymer.ts';
import type * as Stack from '#disreact/core/behaviors/exp/Stack.ts';
import type * as Node from '#disreact/core/behaviors/exp/nodev1.ts';

export let component = undefined as undefined | Element.Func,
           env       = undefined as undefined | Rehydrant.Envelope,
           poly      = undefined as undefined | Polymer.Polymer,
           stack     = undefined as undefined | Stack.Stack<Node.Nodev1>,
           vertex    = undefined as undefined | Node.Nodev1,
           document  = undefined as undefined | Document.Documentold<Node.Nodev1>,
           release = () => {};

export const setRelease = (f: () => void) => {
  release = f;
};

export const runRelease = () => {
  release();
};

export type Global = {
  node?    : Element.Func;
  root?    : Rehydrant.Envelope;
  poly?    : Polymer.Polymer;
  vertex?  : Node.Nodev1;
  document?: Document.Documentold<Node.Nodev1>;
  stack?   : Stack.Stack<Node.Nodev1>;
};

export const set = (v: Node.Functional, d: Document.Documentold<Node.Nodev1>) => {
  vertex = v;
  poly = v.polymer!;
  document = d;
};

export const reset = () => {
  env = undefined;
  component = undefined;
  poly = undefined;
  stack = undefined;
  vertex = undefined;
  document = undefined;
};

export const get = (): Required<Global> => {
  if (!component || !env || !poly) {
    throw new Error('Hooks must be called within a component.');
  }

  return {
    node    : component,
    root    : env,
    poly    : poly,
    stack   : stack,
    vertex  : vertex,
    document: document,
  } as Required<Global>;
};


export const setV1 = (rh: Rehydrant.Envelope, el: Element.Func) => {
  env = rh;
  component = el;
  poly = el.polymer!;
};
