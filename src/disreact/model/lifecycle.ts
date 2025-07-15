import * as Elem from '#disreact/model/Elem.ts';
import * as Fn from '#disreact/model/core/Fn.ts';
import * as Polymer from '#disreact/model/core/Polymer.ts';
import * as Stack from '#disreact/model/core/Stack.ts';
import * as Hooks from '#disreact/runtime/Hooks.ts';

import * as Data from 'effect/Data';
import * as E from 'effect/Effect';
import * as Either from 'effect/Either';

export class EffectError extends Data.TaggedError('EffectError')<{}> {}

const flushComponent = (self: Elem.Component) =>
  E.iterate(self, {
    while: (c) => Polymer.isQueued(c.polymer),
    body : (c) => {
      const effector = Polymer.dequeue(c.polymer)!;

      return Fn.normalizeEffector(effector).pipe(
        E.as(c),
      );
    },
  });

const
  mutex   = E.unsafeMakeSemaphore(1),
  acquire = mutex.take(1),
  release = mutex.release(1);

const initializeComponent = (elem: Elem.Component) =>
  acquire.pipe(
    E.flatMap(() => {
      elem.polymer = Polymer.make(elem);
      Hooks.active.polymer = elem.polymer;

      return Fn.normalizePropsFC(elem.component, elem.props);
    }),
    E.tap(() => {
      Hooks.active.polymer = undefined;
      return release;
    }),
    E.tapDefect(() => release),
    E.map((children) => {
      Polymer.commit(elem.polymer);
      elem.children = Elem.fromJsxChildren(elem, children);
      return elem.children;
    }),
    E.tap(() => flushComponent(elem)),
  );

const initializeFromStack = (stack: Stack.Stack<Elem.Elem>) =>
  stack.pipe(
    Stack.pop,
    Elem.toEither,
    Either.map((elem) =>
      elem.pipe(
        initializeComponent,
        E.map(Stack.pushAllInto(stack)),
      ),
    ),
    Either.mapLeft((elem) =>
      stack.pipe(
        Stack.pushAll(elem.children),
        E.succeed,
      ),
    ),
    Either.merge,
  );

export const initialize = (root: Elem.Elem) =>
  E.iterate(Stack.make(root), {
    while: Stack.condition,
    body : initializeFromStack,
  });

const hydrateComponent = (elem: Elem.Component) =>
  acquire.pipe(
    E.flatMap(() => {
      elem.polymer = Polymer.make(elem);
      Hooks.active.polymer = elem.polymer;

      return Fn.normalizePropsFC(elem.component, elem.props);
    }),
    E.tap(() => {
      Hooks.active.polymer = undefined;
      return release;
    }),
    E.tapDefect(() => release),
    E.map((children) => {
      Polymer.commit(elem.polymer);
      elem.children = Elem.fromJsxChildren(elem, children);
      return elem.children;
    }),
    E.tap(() => {}),
  );

const hydrateFromStack = (stack: Stack.Stack<Elem.Elem>) =>
  stack.pipe(
    Stack.pop,
    Elem.toEither,
    Either.map((elem) =>
      elem.pipe(
        hydrateComponent,
        E.map(Stack.pushAllInto(stack)),
      ),
    ),
    Either.mapLeft((elem) =>
      stack.pipe(
        Stack.pushAll(elem.children),
        E.succeed,
      ),
    ),
    Either.merge,
  );

export const hydrate = (root: Elem.Elem) =>
  E.iterate(Stack.make(root), {
    while: Stack.condition,
    body : hydrateFromStack,
  });
