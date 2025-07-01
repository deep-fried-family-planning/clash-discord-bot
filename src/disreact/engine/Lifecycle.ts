import * as Document from '#disreact/core/Document.ts';
import * as FC from '#disreact/core/FC.ts';
import {INTRINSIC, noop} from '#disreact/core/immutable/constants.ts';
import * as Node from '#disreact/core/Node.ts';
import * as Polymer from '#disreact/core/Polymer.ts';
import * as Stack from '#disreact/core/Stack.ts';
import * as Hooks from '#disreact/engine/runtime/Hooks.ts';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';

const mutex  = E.unsafeMakeSemaphore(1),
      lock   = mutex.take(1),
      unlock = mutex.release(1);

 const render = (node: Node.Func) => {
  const component = node.component;
  const props = node.props;
  const polymer = node.polymer;

  const renderer = component.length === 0
                   ? FC.renderSelf(component)
                   : FC.renderProps(component, props);

  if (FC.isStateless(component)) {
    return renderer;
  }
  return lock.pipe(
    E.tap(() => {
      Hooks.active.polymer = polymer;
    }),
    E.andThen(renderer),
    E.tap(() => {
      Hooks.active.polymer = undefined;
      return unlock;
    }),
    E.map((rendered) => {
      if (Polymer.isStateless(polymer)) {
        FC.markStateless(component);
        return rendered;
      }
      Polymer.commit(polymer);
      return rendered;
    }),
  );
};

const initializeNode = (node: Node.Func, document: Document.Document) => {
  node.polymer = Polymer.empty(node, document);

  return render(node).pipe(
    E.map((rendered) => Node.rendered(node, rendered)),
    E.tap(Polymer.invoke(node.polymer)),
    E.as(node),
  );
};

const hydrateNode = (node: Node.Func, document: Document.Document) => {
  const encoding = Document.getEncoding(document, node.trie);
  if (!encoding) {
    return initializeNode(node, document);
  }
  node.polymer = Polymer.hydrate(node, document, encoding);

  return render(node).pipe(
    E.map((rendered) => Node.rendered(node, rendered)),
    E.tap(Polymer.invoke(node.polymer)),
    E.as(node),
  );
};
import * as Either from 'effect/Either';
import * as Option from 'effect/Option';
import * as Stream from 'effect/Stream';

const initializeSPS = (stack: Stack.Stack) =>
  stack.pipe(
    Stack.pop,
    Node.connect,
    Node.toEither,
    Either.map((node) =>
      render(node).pipe(
        E.map((rendered) => Node.rendered(node, rendered)),
        E.tap(Polymer.invoke(node.polymer)),
      ),
    ),
    Either.mapLeft((node) =>
      node.pipe(
        Node.toChildrenReverse,
        Stack.pushAllInto(stack),
        E.succeed,
      ),
    ),
    Either.merge,
  );

export const initialize = (document: Document.Document) => {
  const stack = Stack.make(document, document.body);

  return E.whileLoop({
    while: () => Stack.while(stack),
    step : noop,
    body : () => {
      const node = Stack.pop(stack);
      Node.connect(node);

      if (!Node.isRenderable(node)) {
        Stack.pushAll(stack, node.children?.toReversed());
        return E.void;
      }

      return pipe(
        initializeNode(node, document),
        E.map(() => {
          Stack.pushAll(stack, node.children?.toReversed());
        }),
      );
    },
  }).pipe(E.as(document));
};

export const hydrate = (document: Document.Document) => {
  const stack = Stack.make(document, document.body);

  return E.whileLoop({
    while: () => Stack.while(stack),
    step : noop,
    body : () => {
      const node = Stack.pop(stack);
      Node.connect(node);

      if (!Node.isRenderable(node)) {
        Stack.pushAll(stack, node.children?.toReversed());
        return E.void;
      }

      return pipe(
        hydrateNode(node, document),
        E.map(() => {
          Stack.pushAll(stack, node.children?.toReversed());
        }),
      );
    },
  }).pipe(E.as(document));
};

export const invoke = (document: Document.Document) => E.suspend(() => {
  if (!document.event) {
    throw new Error();
  }
  const event = document.event;
  const stack = Stack.make(document, document.body);

  let target: Node.Rest | undefined;

  while (Stack.while(stack)) {
    const node = Stack.pop(stack);

    if (
      node._tag === INTRINSIC &&
      (node.step === event.id || node.props[event.lookup] === event.id) &&
      node.props[event.handler]
    ) {
      target = node;
      break;
    }
    Stack.pushAll(stack, node.children?.toReversed());
  }
  if (!target) {
    throw new Error();
  }

  return pipe(
    Node.invoke(event, target.props[event.handler]),
    E.as(document),
  );
});

export const unmount = (node: Node.Node, document: Document.Document) => {
  const visited = new WeakSet();
  const stack = Stack.make(document, node);

  while (Stack.while(stack)) {
    const node = Stack.pop(stack);

    if (visited.has(node)) {
      Node.dispose(node);
      continue;
    }

    visited.add(node);
    Stack.pushAll(stack, node.children?.toReversed());
  }

  return node;
};

export const mount = (node: Node.Node, document: Document.Document) => {
  const stack = Stack.make(document, node);

  return E.whileLoop({
    while: () => Stack.while(stack),
    step : noop,
    body : () => {
      const node = Stack.pop(stack);

      if (Node.isRenderable(node)) {
        return initializeNode(node, document).pipe(
          E.map(() => Stack.pushAll(stack, node.children?.toReversed())),
        );
      }
      Stack.pushAll(stack, node.children?.toReversed());
      return E.void;
    },
  }).pipe(E.as(node));
};

export const rerender = (document: Document.Document) => {

};

export const dehydrate = (document: Document.Document) => {

};
