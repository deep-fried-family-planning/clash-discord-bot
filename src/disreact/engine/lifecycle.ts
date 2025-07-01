import * as Node from '#disreact/core/Node.ts';
import {noop} from '#disreact/core/primitives/constants.ts';
import * as Stack from '#disreact/core/Stack.ts';
import type * as Document from '#src/disreact/core/Document.ts';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';
import * as Polymer from '#disreact/core/Polymer.ts';

const initializeNode = (node: Node.Func, document: Document.Document) => {
  node.polymer = Polymer.mount(node, document);
  return node;
};

const hydrateNode = (node: Node.Func, document: Document.Document) => {

};

export const initialize = (document: Document.Document) => {
  const stack = Stack.make(document, document.body);

  return E.whileLoop({
    while: () => Stack.while(stack),
    step : noop,
    body : () => {
      const node = Stack.pop(stack);

      if (!Node.isRenderable(node)) {
        Stack.pushAll(stack, node.children?.toReversed());
        return E.void;
      }
      return pipe(

        E.void,
      );
    },
  }).pipe(E.as(document));
};

export const hydrate = (document: Document.Document) => {
  const stack = Stack.make(document);

  return E.whileLoop({
    while: () => Stack.while(stack),
    step : noop,
    body : () => {
      const node = Stack.pop(stack);
      return E.void;
    },
  }).pipe(E.as(document));
};

export const invoke = (document: Document.Document) => E.suspend(() => {
  if (!document.event) {
    throw new Error();
  }
  const stack = Stack.make(document);

  while (Stack.while(stack)) {

  }

  return pipe(
    E.void,
    E.as(document),
  );
});

export const unmount = (document: Document.Document, node: Node.Node) => {

};

export const mount = (document: Document.Document, node: Node.Node) => {

};

export const rerender = (document: Document.Document) => {

};

export const dehydrate = (document: Document.Document) => {

};
