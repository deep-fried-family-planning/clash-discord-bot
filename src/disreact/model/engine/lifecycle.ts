import * as Diffable from '#src/disreact/core/behaviors/diffable.ts';
import * as Document from '#src/disreact/core/document.ts';
import * as Node from '#src/disreact/core/node.ts';
import * as Polymer from '#src/disreact/core/polymer.ts';
import * as dispatch from '#src/disreact/model/engine/dispatch.ts';
import * as Stack from '#src/disreact/model/engine/stack.ts';
import {NodeRuntime} from '@effect/platform-node';
import {Effectable, Trie} from 'effect';
import * as E from 'effect/Effect';
import * as Either from 'effect/Either';
import {pipe} from 'effect/Function';
import * as Match from 'effect/Match';
import * as Option from 'effect/Option';

pipe(
  E.log('ope'),
  NodeRuntime.runMain({}),
);

export type Lifecycle = {
  document: Document.Document;
  stack   : Stack.Stack;
  node    : Node.Node;
};

import * as string from 'effect/String';
import * as String from 'effect/String';

Trie.get;

const thing = Either.liftPredicate(Node.isFunctional, (n) => n);
Effectable;
type EitherLR<L, R> = Either.Either<R, L>;
// : EitherLR<Node.Functional, Exclude<Node.Node, Node.Functional>>

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

export const rehydrateSPS = (stack: Stack.Stack) =>
  stack.pipe(
    Stack.pop,
    Match.value,
    Match.when(Node.isFunctional, (node) =>
      stack.pipe(
        Stack.toDocument,
        Document.use((document) =>
          document.pipe(
            Document.getTrie(node.$trie!),
            Option.map(Polymer.hydrate),
            Option.getOrElse(Polymer.strictHydrate),
            Polymer.circular(node, document),
            Polymer.polymerize(node),
          ),
        ),
        dispatch.render, // todo fx
      ),
    ),
    Match.orElse((node) => E.succeed(node)),
    E.map((node) =>
      stack.pipe(
        Stack.toDocument,
        Document.recordNode(node),
        Node.mountValence,
        Node.toValence,
        Stack.pushAllInto(stack),
      ),
    ),
  );

export const invokeSPS = (stack: Stack.Stack) => // todo
  stack.pipe(
    Stack.pop,
    Match.value,
    Match.when(Node.isFunctional, (node) =>
      stack.pipe(
        Stack.toDocument,
        Document.use((document) =>
          document.pipe(
            Document.getTrie(node.$trie!),
            Option.map(Polymer.hydrate),
            Option.getOrElse(Polymer.strictHydrate),
            Polymer.circular(node, document),
            Polymer.polymerize(node),
          ),
        ),
        dispatch.render,
      ),
    ),
    Match.orElse((node) => E.succeed(node)),
    E.map((node) =>
      stack.pipe(
        Stack.toDocument,
        Document.recordNode(node),
        Node.mountValence,
        Node.toValence,
        Stack.pushAllInto(stack),
      ),
    ),
  );

export const mountSPS = (stack: Stack.Stack) =>
  stack.pipe(
    Stack.pop,
  );

export const unmountSPS = (stack: Stack.Stack) =>
  stack.pipe(
    Stack.pop,
    Match.value,
    Match.when((node) => Stack.visited(stack, node), (node) =>
      E.sync(() =>
        stack.pipe(
          Document.fromStack,
          Document.forgetNode(node),
          Polymer.dispose,
          Node.dispose, // todo dismount fx?
        ),
      ),
    ),
    Match.orElse((node) =>
      stack.pipe(
        Stack.push(node),
        Stack.visit(node),
        Node.toValence,
        E.succeed,
      ),
    ),
    E.map(Stack.pushAllInto(stack)),
  );

export const rerenderSPS = (stack: Stack.Stack) =>
  stack.pipe(
    Stack.pop,
    Match.value,
    Match.when(Diffable.hasDiff, (n) => {}),
  );
