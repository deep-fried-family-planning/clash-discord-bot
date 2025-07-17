import * as Stack from '#disreact/core/Stack.ts';
import * as Hooks from '#disreact/Hooks.ts';
import * as Element from '#disreact/model/Element.ts';
import type * as Event from '#disreact/model/Event.ts';
import * as Fn from '#disreact/model/Fn.ts';
import * as Polymer from '#disreact/model/Polymer.ts';
import {ModelEncoder} from '#disreact/model/ModelEncoder.ts';
import * as Jsx from '#disreact/model/runtime/Jsx.tsx';
import * as Data from 'effect/Data';
import * as Effect from 'effect/Effect';
import * as E from 'effect/Effect';
import * as Either from 'effect/Either';
import {pipe} from 'effect/Function';

export class RenderError extends Data.TaggedError('RenderError')<{}> {}

const mutex = Effect.unsafeMakeSemaphore(1);

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
    mutex.withPermits(1),
  );



export const encode = (root: Element.Element) => ModelEncoder.use(({encodeText, encodeRest}) => {
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
          ),
        ),
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
