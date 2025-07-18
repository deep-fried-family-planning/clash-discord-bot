import * as Stack from '#disreact/core/Stack.ts';
import * as Element from '#disreact/model/entity/Element.ts';
import {Codec} from '#disreact/model/service/Codec.ts';
import * as Hooks from '#disreact/runtime/Hook.ts';
import * as Effect from 'effect/Effect';
import * as Either from 'effect/Either';
import {pipe} from 'effect/Function';

const releaseSync = Effect.sync(() => {
  Hooks.active.polymer = undefined;
});

export const mutex = Effect.unsafeMakeSemaphore(1);
export const acquire = mutex.take(1);
export const release = releaseSync.pipe(
  Effect.andThen(mutex.release(1)),
);

const mountElement = (el: Element.Element) =>
  acquire.pipe(
    Effect.map(() => {
      Hooks.active.polymer = el.polymer;
      return Element.mount(el);
    }),
    Effect.andThen(Element.render(el)),
    Effect.ensuring(release),
    Effect.map(Element.liftJsxInto(el)),
  );

const initializeElement = (el: Element.Element) =>
  mountElement(el);

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
    Effect.as(root),
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
