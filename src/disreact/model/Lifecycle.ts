import * as Document from '#disreact/core/Document.ts';
import * as Node from '#disreact/core/Node.ts';
import * as Stack from '#disreact/core/Stack.ts';
import * as Hooks from '#disreact/runtime/Hooks.ts';
import * as E from 'effect/Effect';
import * as Either from 'effect/Either';
import * as Option from 'effect/Option';

const mutex  = E.unsafeMakeSemaphore(1),
      lock   = mutex.take(1),
      unlock = mutex.release(1);

const acquireMutex = (node: Node.Func) =>
  lock.pipe(
    E.map(() => {
      Hooks.active.polymer = node.polymer;
      return node;
    }),
  );

const releaseMutex = <A, E, R>(effect: E.Effect<A, E, R>) =>
  effect.pipe(
    E.tap(() => {
      Hooks.active.polymer = undefined;
      return unlock;
    }),
    E.tapDefect(() => unlock),
  );

const initializeSPS = (stack: Stack.Stack) =>
  stack.pipe(
    Stack.pop,
    Node.eitherRenderable,
    Either.map((node) =>
      node.pipe(
        Node.initialize(stack.document),
        acquireMutex,
        E.andThen(Node.render),
        releaseMutex,
        E.map(Node.commit(node)),
        E.map(Node.accept),
        E.map(Node.toReversed),
        E.map(Stack.pushAllInto(stack)),
        E.tap(Node.flush(node)),
      ),
    ),
    Either.mapLeft((node) =>
      node.pipe(
        Node.connect,
        Node.toReversed,
        Stack.pushAllInto(stack),
        E.succeed,
      ),
    ),
    Either.merge,
  );

const hydrateSPS = (stack: Stack.Stack) =>
  stack.pipe(
    Stack.pop,
    Node.eitherRenderable,
    Either.map((node) =>
      node.pipe(
        Node.hydrate(stack.document),
        acquireMutex,
        E.andThen(Node.render),
        releaseMutex,
        E.map(Node.commit(node)),
        E.map(Node.accept),
        E.map(Node.toReversed),
        E.map(Stack.pushAllInto(stack)),
      ),
    ),
    Either.mapLeft((node) =>
      node.pipe(
        Node.connect,
        Node.toReversed,
        Stack.pushAllInto(stack),
        E.succeed,
      ),
    ),
    Either.merge,
  );

export const initialize = (document: Document.Document) =>
  E.iterate(Stack.make(document, document.body), {
    while: Stack.while,
    body : initializeSPS,
  }).pipe(
    E.as(document),
  );

export const hydrate = (document: Document.Document) =>
  E.iterate(Stack.make(document, document.body), {
    while: Stack.while,
    body : hydrateSPS,
  }).pipe(
    E.as(document),
  );

export const invoke = (document: Document.Document) =>
  document.body.pipe(
    Node.findWithin((node): node is Node.Rest => {
      if (Node.isInvokable(node)) {
        if (!node.props[document.event!.lookup]) {
          return false;
        }
        if (document.event!.id === node.step) {
          return true;
        }
        if (node.props[document.event!.lookup] === document.event!.id) {
          return true;
        }
      }
      return false;
    }),
    Option.getOrThrow,
    Node.invoke(document.event),
    E.as(document),
  );

const mount = (root: Node.Node, document: Document.Document) =>
  E.iterate(Stack.make(document, root), {
    while: Stack.while,
    body : initializeSPS,
  });

const unmount = (root: Node.Node, document: Document.Document) => {
  const stack = Stack.make(document, root);
  const visited = new WeakSet<Node.Node>();

  while (Stack.while(stack)) {
    const node = Stack.pop(stack);

    if (!visited.has(node)) {
      Stack.pushAll(stack, Node.toReversed(node));
      visited.add(node);
      continue;
    }
    Node.dispose(node, document);
  }
  return root;
};

export const rerender = (document: Document.Document) =>
  document.pipe(
    Document.getFlags,
    Node.lca,
    Option.map(),
    Option.getOrElse(() => document),
  );

export const dehydrate = (document: Document.Document) => {

};
