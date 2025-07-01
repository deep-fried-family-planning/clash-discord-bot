import * as Node from '#disreact/core/Node.ts';
import {noop} from '#disreact/core/primitives/constants.ts';
import * as Stack from '#disreact/core/Stack.ts';
import type * as Document from '#src/disreact/core/Document.ts';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';
import * as Polymer from '#disreact/core/Polymer.ts';
import * as Hooks from '#disreact/engine/runtime/Hooks.ts';
import * as FC from '#disreact/core/FC.ts';

const mutex  = E.unsafeMakeSemaphore(1),
      lock   = mutex.take(1),
      unlock = mutex.release(1);

const render = (node: Node.Func) => {
  const component = node.component;
  const props = node.props;

  if (component.stateless) {
    return FC.renderStateless(component);
  }
  return lock.pipe(
    E.tap(() => {
      Hooks.active.polymer = node.polymer;
    }),
    E.andThen(FC.render(component, props)),
    E.tap(() => {
      Polymer.commit(node.polymer);
      Hooks.active.polymer = undefined;
      return unlock;
    }),
  );
};

const renderIntoSelf = (node: Node.Func) => {
  const component = node.component;
  const props = node.props;

  if (component.stateless) {
    return FC.renderStateless(component);
  }
  return lock.pipe(
    E.tap(() => {
      Hooks.active.polymer = node.polymer;
    }),
    E.andThen(FC.render(component, props)),
    E.tap(() => {
      Polymer.commit(node.polymer);
      Hooks.active.polymer = undefined;
      return unlock;
    }),
  );
};

const initializeNode = (node: Node.Func, document: Document.Document) => {
  node.polymer = Polymer.mount(node, document);
  return pipe(

  );
};

const hydrateNode = (node: Node.Func, document: Document.Document) => {
  return render(node);
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
      node.polymer = Polymer.mount(node, document);
      return pipe(
        render(node),
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
