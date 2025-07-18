import * as Stack from '#disreact/core/Stack.ts';
import * as Hooks from '#disreact/Hooks.ts';
import {Codec} from '#disreact/model/service/Codec.ts';
import * as Element from '#disreact/model/entity/Element.ts';
import type * as Event from '#disreact/model/entity/Event.ts';
import * as Effect from 'effect/Effect';
import * as E from 'effect/Effect';
import * as Either from 'effect/Either';
import {pipe} from 'effect/Function';

export const mutex = Effect.unsafeMakeSemaphore(1);

export const mountElement = (start: Element.Element) =>
  start.pipe(

  );

const release = pipe(
  E.sync(() => {
    Hooks.active.polymer = undefined;
  }),
  E.andThen(mutex.release(1)),
);

const renderElement = (elem: Element.Element) =>
  pipe(
    Effect.sync(() => {
      Hooks.active.polymer = elem.polymer;
    }),
    Effect.andThen(Element.render(elem)),
    Effect.map((children) => {
      Hooks.active.polymer = undefined;
      return children;
    }),
  );

export const encode = (root: Element.Element) => Codec.use(({encodeText, encodeRest}) => {
  const stack = [root._env.root],
        final = {} as any,
        args  = new WeakMap(),
        outs  = new WeakMap().set(root._env.root, final);

  while (stack.length) {
    const node = stack.pop()!,
          out  = outs.get(node);

    switch (node._tag) {
      case Element.TEXT: {
        if (!node.text) {
          continue;
        }
        encodeText(node as Element.Text, out);
        continue;
      }
      case Element.FRAGMENT:
      case Element.COMPONENT: {
        if (!node.children) {
          continue;
        }
        for (const c of node.children.toReversed()) {
          outs.set(c, out);
          stack.push(c);
        }
      }
      case Element.INTRINSIC: {
        if (args.has(node)) {
          encodeRest(node as Element.Intrinsic, out, args.get(node)!);
          continue;
        }
        if (!node.children || node.children.length === 0) {
          encodeRest(node as Element.Intrinsic, out, {});
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

export const invokeIntrinsicElement = (elem: Element.Element, event: Event.Event) => {

};

const mountFromStack = (stack: Stack.Stack<Element.Element>) =>
  stack.pipe(
    Stack.pop,
    Element.toEither,
    Either.map((elem) =>
      elem.pipe(
        Element.mount,

        E.map(Stack.pushAllInto(stack)),
      ),
    ),
  );

const unmountFromStack = (stack: Stack.Stack<Element.Element>) =>
  stack.pipe(
    Stack.pop,
    Element.toEither,
    Either.map((elem) =>
      elem.pipe(
        Element.unmount,
        E.map(Stack.pushAllInto(stack)),
      ),
    ),
  );

const renderer = pipe(
  Effect.liftPredicate(Element.isComponent, (self) => {
    self;
  }),
  Effect.
);

export const mount = (root: Element.Element) =>
  E.iterate(Stack.make(root), {
    while: Stack.condition,
    body : (stack) =>
      stack.pipe(
        Stack.pop,
        Element.toEither,
        Either.map((elem) =>
          elem.pipe(
            Element.mount,
            renderElement,
            Effect.map((children) => {
              elem.children = Element.fromJsxChildren(elem, children);
              return Stack.pushAll(stack, elem.children);
            }),
          ),
        ),
        Either.mapLeft((elem) =>
          Effect.succeed(
            Stack.pushAll(stack, elem.children),
          ),
        ),
        Either.merge,
      ),
  });

const unmount = (elem: Element.Element) =>
  E.iterate(Stack.make(elem), {
    while: Stack.condition,
    body : (stack) =>
      stack.pipe(
        Stack.pop,
        Element.toEither,
        Either.map((elem) =>
          elem.pipe(
            Element.unmount,
          ),
        ),
      ),
  });

export const rerender = (root: Element.Element) => {
  const lca = root;
};
