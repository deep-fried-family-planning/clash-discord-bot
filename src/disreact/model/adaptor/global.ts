import type * as Element from '#src/disreact/model/adaptor/exp/domain/old/element.ts';
import type * as Rehydrant from '#src/disreact/model/adaptor/exp/domain/old/envelope.ts';
import type * as Document from '#src/disreact/model/internal/domain/document.ts';
import type * as Polymer from '#src/disreact/model/internal/domain/polymer.ts';
import type * as Stack from '#src/disreact/model/internal/stack.ts';
import type * as Node from '#src/disreact/model/internal/domain/node.ts';

export let component = undefined as undefined | Element.Func,
           env       = undefined as undefined | Rehydrant.Envelope,
           poly      = undefined as undefined | Polymer.Polymer,
           stack     = undefined as undefined | Stack.Stack<Node.Node>,
           vertex    = undefined as undefined | Node.Node,
           document  = undefined as undefined | Document.Document<Node.Node>,
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
  vertex?  : Node.Node;
  document?: Document.Document<Node.Node>;
  stack?   : Stack.Stack<Node.Node>;
};

export const set = (v: Node.Functional, d: Document.Document<Node.Node>) => {
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
