import type * as Document from '#src/disreact/model/internal/domain/document.ts';
import * as Node from '#src/disreact/model/internal/domain/node.ts';
import * as Stack from '#src/disreact/model/internal/stack.ts';
import {Stream} from 'effect';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';

export type Traversal = never;

export const unmount = (s: Stack.Stack<Node.Node>) =>
  s.pipe(
    Stack.pop,
    Node.map((n) => {
      if (Stack.visited(s, n)) {
        return n.pipe(
          Node.unmount(Stack.document(s)),
          E.as(undefined),
        );
      }
      return n.pipe(
        Node.valenceRight,
        E.succeed,
      );
    }),
    E.map((ns) => {}),
  );

export const mount = (s: Stack.Stack<Node.Node>) =>
  s.pipe(
    Stack.pop,
    Node.map((n) => {
      if (Stack.visited(s, n)) {
        return n.pipe(
          Node.mount(Stack.document(s)),
          E.as(undefined),
        );
      }
    }),
  );
