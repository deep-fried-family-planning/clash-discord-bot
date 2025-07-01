import * as FC from '#disreact/core/FC.ts';
import * as Node from '#disreact/core/Node.ts';
import * as Polymer from '#disreact/core/Polymer.ts';
import {noop} from '#disreact/core/primitives/constants.ts';
import * as Stack from '#disreact/core/Stack.ts';
import * as Hooks from '#disreact/runtime/Hooks.ts';
import type * as Document from '#disreact/core/Document.ts';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';

const mutex  = E.unsafeMakeSemaphore(1),
      lock   = mutex.take(1),
      unlock = mutex.release(1);

const render = (node: Node.Func) => {
  const component = node.component;
  const props = node.props;

  if (!component.state) {
    if (!component.length) {
      return FC.renderZero(component);
    }
    return FC.renderProps(component, props);
  }
  return lock.pipe(
    E.map(() => {
      Hooks.active.polymer = node.polymer;
    }),
    E.andThen(FC.renderProps(component, props)),
    E.tap(() => {
      Hooks.active.polymer = undefined;
      return unlock;
    }),
    E.map((children) => {
      if (!node.polymer.stack.length) {
        FC.markStateless(component);
      }
      Polymer.commit(node.polymer);
      if (!children) {
        return [];
      }
      if (Array.isArray(children)) {
        return Node.connectAllRendered(node, children);
      }
      return Node.connectSingleRendered(node, children);
    }),
  );
};

const renderIntoSelf = (node: Node.Func) => {
  const component = node.component;
  const props = node.props;

  if (!component.props) {
    return FC.renderZero(component);
  }
  return lock.pipe(
    E.tap(() => {
      Hooks.active.polymer = node.polymer;
    }),
    E.andThen(FC.renderProps(component, props)),
    E.tap(() => {
      Polymer.commit(node.polymer);
      Hooks.active.polymer = undefined;
      return unlock;
    }),
  );
};

const initializeNode = (node: Node.Func, document: Document.Document) => {
  node.polymer = Polymer.empty(node, document);
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
      node.polymer = Polymer.empty(node, document);
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
