import * as Fn from '#disreact/model/entity/Fn.ts';
import * as Polymer from '#disreact/model/entity/Polymer.ts';
import * as Stack from '#disreact/core/Stack.ts';
import * as Element from '#disreact/model/entity/Element.ts';
import {ModelCodec} from '#disreact/model/ModelCodec.ts';
import * as Jsx from '#disreact/runtime/Jsx.tsx';
import * as Hooks from '#disreact/Hooks.ts';
import * as Data from 'effect/Data';
import * as E from 'effect/Effect';
import * as Either from 'effect/Either';

export class RenderError extends Data.TaggedError('RenderError')<{}> {}

export class FlushError extends Data.TaggedError('EffectError')<{}> {}

export class InvokeError extends Data.TaggedError('InvokeError')<{}> {}

export class HydrateError extends Data.TaggedError('HydrateError')<{}> {}

export class DehydrateError extends Data.TaggedError('EncodeError')<{}> {}

const flushComponent = (self: Element.Component) =>
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

const initializeComponent = (elem: Element.Component) =>
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
      elem.children = Element.fromJsxChildren(elem, children);
      return elem.children;
    }),
    E.tap(flushComponent(elem)),
  );

const initializeFromStack = (stack: Stack.Stack<Element.Element>) =>
  stack.pipe(
    Stack.pop,
    Element.toEither,
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

export const initialize = (root: Element.Element) =>
  E.iterate(Stack.make(root), {
    while: Stack.condition,
    body : initializeFromStack,
  });

export const hydrateEntrypoint = (type: Jsx.Entrypoint | Fn.FC | Jsx.Jsx | string) => E.suspend(() => {
  const id = typeof type === 'string' ? type :
             typeof type === 'function' ? type.entrypoint :
             Jsx.isJsx(type) ? type.entrypoint :
             type.id;

  if (!id) {
    return E.fail(new HydrateError());
  }
  const entrypoint = Jsx.findEntrypoint(id);

  if (!entrypoint) {
    return E.fail(new HydrateError());
  }
  return E.succeed(entrypoint);
});

const hydrateComponent = (elem: Element.Component) =>
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
      elem.children = Element.fromJsxChildren(elem, children);
      return elem.children;
    }),
    E.tap(() => {}),
  );

const hydrateFromStack = (stack: Stack.Stack<Element.Element>) =>
  stack.pipe(
    Stack.pop,
    Element.toEither,
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

export const hydrate = (root: Element.Element) =>
  E.iterate(Stack.make(root), {
    while: Stack.condition,
    body : hydrateFromStack,
  });

export const encode = (root: Element.Element) => ModelCodec.use(({encodeText, encodeRest}) => {
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
import type * as Event from '#disreact/model/entity/Event.ts';

export const invokeIntrinsicElement = (elem: Element.Element, event: Event.Event) => {

};
