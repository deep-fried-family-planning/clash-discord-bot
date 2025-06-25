import type * as Document from '#src/disreact/model/internal/document.ts';
import * as Stack from '#src/disreact/model/internal/stack.ts';
import {pipe} from 'effect/Function';
import * as E from 'effect/Effect';
import * as Node from '#src/disreact/model/internal/node.ts';

export const initialize = (d: Document.Document<Node.Node>) =>
  pipe(
    E.iterate(Stack.make(d.root), {
      while: Stack.condition,
      body : (stack) =>
        pipe(
          Stack.pop(stack),
          Node.mount(d),
          E.map(Stack.pushInto(stack)),
        ),
    }),
    E.andThen((stack) => {
      if (!d.flags.size) {
        return E.succeed(d);
      }
    }),
    E.as(d),
  );

export const hydrate = (d: Document.Document<Node.Node>) =>
  pipe(
    E.iterate(Stack.make(d.root), {
      while: Stack.condition,
      body : (stack) =>
        pipe(
          Stack.pop(stack),
          Node.hydrate(d),
          E.map(Stack.pushInto(stack)),
        ),
    }),
    E.as(d),
  );
