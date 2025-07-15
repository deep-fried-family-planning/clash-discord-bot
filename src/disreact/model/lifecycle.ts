import {FUNCTIONAL, LIST_NODE, TEXT_NODE} from '#disreact/core/immutable/constants.ts';
import * as Fn from '#disreact/model/core/Fn.ts';
import * as Polymer from '#disreact/model/core/Polymer.ts';
import * as Stack from '#disreact/model/core/Stack.ts';
import * as Elem from '#disreact/model/entity/Elem.ts';
import {Encoder} from '#disreact/model/Encoder.ts';
import type * as Jsx from '#disreact/model/runtime/Jsx.ts';
import * as Hooks from '#disreact/runtime/Hooks.ts';

import * as Data from 'effect/Data';
import * as E from 'effect/Effect';
import * as Either from 'effect/Either';
import * as MutableList from 'effect/MutableList';
import type {Element} from 'effect/Schema';

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
    E.tap(flushComponent(elem)),
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

export const encode = (root: Elem.Elem) => Encoder.use(({encodeText, encodeRest}) => {
  const stack = [root._env.root],
        final = {} as any,
        args  = new WeakMap(),
        outs  = new WeakMap().set(root._env.root, final);

  while (stack.length) {
    const node = stack.pop()!,
          out  = outs.get(node);

    switch (node._tag) {
      case Elem.TEXT: {
        if (!node.text) {
          continue;
        }
        encodeText(node as Elem.Text, out);
        continue;
      }
      case Elem.FRAGMENT:
      case Elem.COMPONENT: {
        if (!node.children) {
          continue;
        }
        for (const c of node.children.toReversed()) {
          outs.set(c, out);
          stack.push(c);
        }
      }
      case Elem.INTRINSIC: {
        if (args.has(node)) {
          encodeRest(node as Elem.Intrinsic, out, args.get(node)!);
          continue;
        }
        if (!node.children || node.children.length === 0) {
          encodeRest(node as Elem.Intrinsic, out, {});
          continue;
        }
        const arg = {};
        args.set(node, arg);
        stack.push(node);

        for (const c of node.children.toReversed()) {
          outs.set(c, arg);
          stack.push(node);
        }
      }
    }
  }
  for (const key of Object.keys(final)) {
    if (final[key]) {
      return {
        _tag   : key,
        hydrant: {},
        data   : final[key][0],
      };
    }
  }
  return null;
});

export const invoke = (root: Elem.Elem, event: Jsx.Event) => {

};
