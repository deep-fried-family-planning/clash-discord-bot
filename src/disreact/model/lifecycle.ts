import * as Component from '#src/disreact/model/internal/core/domain/old/component.ts';
import * as Element from '#src/disreact/model/internal/core/domain/old/element.ts';
import type * as Rehydrant from '#src/disreact/model/internal/core/domain/old/envelope.ts';
import * as Stack from '#src/disreact/model/internal/stack.ts';
import type * as Cause from 'effect/Cause';
import * as Data from 'effect/Data';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';

export class HydrationError extends Data.TaggedError('HydrationError')<{
  message?: string;
  cause?  : Cause.Cause<Error>;
}> {}

export const hydrateNode = (n: Element.Element, rh: Rehydrant.Envelope) =>
  pipe(
    Component.mount,
  );

export const hydrateRoot = (rh: Rehydrant.Envelope) => {
  return E.iterate(Stack.make(rh.root), {
    while: Stack.condition,
    body : (stack) =>
      stack.pipe(
        Stack.pop,
        Element.match({
          text: (n) => E.succeed(n),
          rest: (n) => E.succeed(n),
          func: (n) =>
            pipe(
              E.succeed(n),
            ),
        }),
        E.map((m) => Stack.pushNodesInto(m, stack)),
      ),
  });
};
