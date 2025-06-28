import * as Document from '#src/disreact/core/document.ts';
import * as Node from '#src/disreact/core/node.ts';
import * as Polymer from '#src/disreact/core/polymer.ts';
import * as dispatch from '#src/disreact/engine/dispatch.ts';
import * as Stack from '#src/disreact/engine/stack.ts';
import * as E from 'effect/Effect';
import * as Either from 'effect/Either';
import {pipe} from 'effect/Function';
import * as Match from 'effect/Match';
import * as Option from 'effect/Option';

const spsSync = (stack: Stack.Stack) =>
  stack.pipe(
    Stack.pop,
    Node.attachDocument(stack.document),
    Node.tap((node) =>
      stack.document.pipe(
        Document.recordNode(node),
      ),
    ),
    Match.value,
    Match.when(Node.isFunctional, (node) =>
      pipe(
        Polymer.empty(),
        Polymer.attachDocument(stack.document),
        Polymer.circular(node, stack.document),
        Polymer.polymerize(node),
      ),
    ),
    Match.either,
    Either.map((n) =>
      n.pipe(),
    ),
  );

const initFunctional = (node: Node.Functional) =>
  pipe(
    Polymer.empty(),
    Polymer.attachNode(node),
    Polymer.attachDocument(node.document!),
    Polymer.polymerize(node),
    dispatch.render,
    E.tap(dispatch.update),
    E.map(Node.mountValence),
    E.map(Node.toValence),
    E.map(Option.fromNullable),
  );

const initWithContinuity = (stack: Stack.Stack) => {
  const node = pipe(
    Stack.pop(stack),
    Node.attachDocument(stack.document),
  );

  if (!Node.isFunctional(node)) {
    Node.mountValence(node);
    Stack.pushAll(stack, node.valence);

    while (Stack.condition(stack)) {
      const next = Stack.pop(stack);

      if (Node.isFunctional(next)) {
        return initFunctional(next);
      }
      Node.mountValence(node);
      Stack.pushAll(node.valence);
    }
    return E.succeedNone;
  }
  return initFunctional(node);
};

export const initializeDocument = (document: Document.Document) =>
  pipe(
    E.iterate(Stack.root(document), {
      while: Stack.condition,
      body : (stack) =>
        initWithContinuity(stack).pipe(
          E.map(Option.getOrUndefined),
          E.map(Stack.pushAllInto(stack)),
        ),
    }),
    E.as(document),
  );

export const initializeSPS = (stack: Stack.Stack) =>
  stack.pipe(
    Stack.pop,
    Document,
    Match.value,
    Match.when(Node.isFunctional, (node) =>
      Polymer.empty().pipe(
        Polymer.circular(node, stack.document),
        Polymer.polymerize(node),
        dispatch.render,
      ),
    ),
    Match.orElse((node) => E.succeed(node)),
    E.map((node) =>
      stack.pipe(
        Document.fromStack,
        Document.recordNode(node),
        Node.mountValence,
        Node.toValence,
        Stack.pushAllInto(stack),
      ),
    ),
  );

const rehydrateFunctional = (node: Node.Functional) =>
  pipe(
    node.document!,
    Document.getTrie(node.$trie!),
    Option.map(Polymer.hydrate),
    Option.getOrElse(Polymer.strictHydrate),
    Polymer.circular(node, node.document!),
    Polymer.polymerize(node),
    dispatch.render,
    E.tap(dispatch.update),
    E.map(Node.mountValence),
    E.map(Node.toValence),
    E.map(Option.fromNullable),
  );
