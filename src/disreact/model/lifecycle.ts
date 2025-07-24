import {Codec} from '#disreact/model/Codec.ts';
import * as Stack from '#disreact/model/core/Stack.ts';
import * as Element from '#disreact/model/entity/Element.ts';
import type * as Envelope from '#disreact/model/entity/Envelope.ts';
import * as Hooks from '#disreact/runtime/Hook.ts';
import * as Effect from 'effect/Effect';
import * as Either from 'effect/Either';
import {pipe} from 'effect/Function';
import * as GlobalValue from 'effect/GlobalValue';

const mutex = GlobalValue.globalValue(
  Symbol.for('disreact/mutex'),
  () => Effect.unsafeMakeSemaphore(1),
);

const take = mutex.take(1);

const acquire = take;

const acquireElement = (el: Element.Element) =>
  take.pipe(
    Effect.map(() => {
      Hooks.active.polymer = el.polymer;
      return el;
    }),
  );

const release = Effect.andThen(
  Effect.sync(() => {
    Hooks.active.polymer = undefined;
  }),
  mutex.release(1),
);

const mountElement = (el: Element.Element) =>
  acquire.pipe(
    Effect.map(() => {
      Hooks.active.polymer = el.polymer;
      return Element.mount(el);
    }),
    Effect.andThen(Element.render(el)),
    Effect.ensuring(release),
    Effect.map((children) => {
      el.children = Element.fromRender(el, children);
      return el;
    }),
    Effect.tap(
      el.pipe(
        Element.flush,
      ),
    ),
  );

const initializeElement = (el: Element.Element) =>
  mountElement(el);

const initializeStack = (stack: Stack.Stack<Element.Element>) => {

};

export const initialize = (root: Element.Element) =>
  pipe(
    Effect.iterate(Stack.make(root), {
      while: Stack.condition,
      body : (stack) =>
        stack.pipe(
          Stack.pop,
          Element.either,
          Either.map(initializeElement),
          Either.mapLeft(Effect.succeed),
          Either.merge,
          Effect.map((el) => Stack.pushAll(stack, el.children)),
        ),
    }),
    Effect.map(Stack.root),
  );

const hydrateElement = (el: Element.Element) =>
  acquire.pipe(
    Effect.map(() => {
      Hooks.active.polymer = el.polymer;
    }),
    Effect.andThen(Element.render(el)),
    Effect.ensuring(release),
    Effect.map((children) => {
      el.children = Element.fromRender(el, children);
      return Stack.pushAll(el.children);
    }),
  );

export const hydrate = (env: Envelope.Envelope) =>
  pipe(
    Effect.iterate(Stack.make(env.root), {
      while: Stack.condition,
      body : (stack) =>
        stack.pipe(
          Stack.pop,
          Element.either,
          Either.map(hydrateElement),
          Either.mapLeft((el) =>
            Effect.succeed(Stack.pushAll(el.children)),
          ),
          Either.merge,
          Effect.ap(Effect.succeed(stack)),
        ),
    }),
    Effect.andThen(Effect.suspend(() => {
      // todo
      return Effect.void;
    })),
    Effect.as(env),
  );

export const invoke = (env: Envelope.Envelope) =>
  pipe(
    Effect.void,
    Effect.as(env),
  );

const mount = (root: Element.Element) =>
  Effect.iterate(Stack.make(root), {
    while: Stack.condition,
    body : (stack) =>
      stack.pipe(
        Stack.pop,
        Element.either,
        Either.map(mountElement),
        Either.mapLeft(Effect.succeed),
        Either.merge,
        Effect.map((el) => Stack.pushAll(stack, el.children)),
      ),
  });

export const unmount = (root: Element.Element) => Effect.suspend(() => {
  const visited = new Set<Element.Element>();
  const stack = Stack.make(root);

  while (Stack.condition(stack)) {
    const cur = Stack.pop(stack);

    if (visited.has(cur)) {
      Element.unmount(cur);
      continue;
    }
    visited.add(cur);
    Stack.pushAll(stack, cur.children);
  }
  return Effect.void;
});


import * as Option from 'effect/Option';
export const rerender = (env: Envelope.Envelope) =>
  pipe(
    Element.lowestCommonAncestor(env.flags),
    Option.getOrElse(() => env.root),
    Element.use((lca) => {
      return Effect.succeed(env);
    }),
  );

export const encode = (root: Element.Element) => Codec.use(({encodeText, encodeRest}) => {
  const stack = [root.env.root],
        final = {} as any,
        args  = new WeakMap(),
        outs  = new WeakMap().set(root.env.root, final);

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
