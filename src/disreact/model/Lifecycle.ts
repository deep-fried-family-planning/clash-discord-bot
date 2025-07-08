import * as Document from '#disreact/core/Document.ts';
import {FRAGMENT, FUNCTIONAL, INTRINSIC, LIST_NODE, TEXT_NODE} from '#disreact/core/immutable/constants.ts';
import * as Element from '#disreact/core/Element.ts';
import * as Stack from '#disreact/core/Stack.ts';
import {Encoder} from '#disreact/model/Encoder.ts';
import * as Hooks from '#disreact/runtime/Hooks.ts';
import * as E from 'effect/Effect';
import * as Either from 'effect/Either';
import * as MutableList from 'effect/MutableList';
import * as Option from 'effect/Option';

const mutex  = E.unsafeMakeSemaphore(1),
      lock   = mutex.take(1),
      unlock = mutex.release(1);

const acquireMutex = (node: Element.Func) =>
  lock.pipe(
    E.map(() => {
      Hooks.active.polymer = node.polymer;
      return node;
    }),
  );

const releaseMutex = <A, E, R>(effect: E.Effect<A, E, R>) =>
  effect.pipe(
    E.tap(() => {
      Hooks.active.polymer = undefined;
      return unlock;
    }),
    E.tapDefect(() => unlock),
  );

const initializeSPS = (stack: Stack.Stack) =>
  stack.pipe(
    Stack.pop,
    Element.eitherRenderable,
    Either.map((node) =>
      node.pipe(
        Element.initialize(stack.origin!),
        acquireMutex,
        E.andThen(Element.render),
        releaseMutex,
        E.map(Element.commit(node)),
        E.map(Element.accept),
        E.map(Element.toReversed),
        E.map(Stack.pushAllInto(stack)),
        E.tap(Element.flush(node)),
      ),
    ),
    Either.mapLeft((node) =>
      node.pipe(
        Element.connect,
        Element.toReversed,
        Stack.pushAllInto(stack),
        E.succeed,
      ),
    ),
    Either.merge,
  );

const hydrateSPS = (stack: Stack.Stack) =>
  stack.pipe(
    Stack.pop,
    Element.eitherRenderable,
    Either.map((element) =>
      element.pipe(
        Element.hydrate(stack.origin!),
        acquireMutex,
        E.andThen(Element.render),
        releaseMutex,
        E.map(Element.commit(element)),
        E.map(Element.accept),
        E.map(Element.toReversed),
        E.map(Stack.pushAllInto(stack)),
      ),
    ),
    Either.mapLeft((node) =>
      node.pipe(
        Element.liftPropsChildren,
        Element.toReversed,
        Stack.pushAllInto(stack),
        E.succeed,
      ),
    ),
    Either.merge,
  );

export const initialize = (document: Document.Document) =>
  E.iterate(Stack.make(document, document.body), {
    while: Stack.condition,
    body : initializeSPS,
  });

export const hydrate = (document: Document.Document) =>
  E.iterate(Stack.make(document, document.body), {
    while: Stack.condition,
    body : hydrateSPS,
  }).pipe(
    E.as(document),
  );

export const invoke = (document: Document.Document) =>
  document.body.pipe(
    Element.findWithin((node): node is Element.Rest => {
      if (Element.isInvokable(node)) {
        if (!node.props[document.event!.lookup]) {
          return false;
        }
        if (document.event!.id === node.step) {
          return true;
        }
        if (node.props[document.event!.lookup] === document.event!.id) {
          return true;
        }
      }
      return false;
    }),
    Option.getOrThrow,
    Element.invoke(document.event),
    E.as(document),
  );

const mount = (root: Element.Element, document: Document.Document) =>
  E.iterate(Stack.make(document, root), {
    while: Stack.condition,
    body : initializeSPS,
  });

const unmount = (root: Element.Element, document: Document.Document) => {
  const stack = Stack.make(document, root);
  const visited = new WeakSet<Element.Element>();

  while (Stack.condition(stack)) {
    const node = Stack.pop(stack);

    if (!visited.has(node)) {
      Stack.pushAll(stack, Element.toReversed(node));
      visited.add(node);
      continue;
    }
    Element.dispose(node, document);
  }
  return root;
};
import * as Traversal from '#disreact/core/Traversal.ts';
export const rerender = (document: Document.Document) =>
  document.pipe(
    Document.getFlags,
    Traversal.lowestCommonAncestor,
    Option.fromNullable,
    Option.map(),
    Option.getOrElse(() => document),
  );

export const dehydrate = (document: Document.Document) => {

};

export type Encoding = Record<string, any[]>;

export const encodeDocument = (d?: Document.Document) => Encoder.use(({encodeText, encodeRest}) => {
  if (!d) {
    return null;
  }
  const s = Stack.make(d, d.body);
  const stack = MutableList.make<Element.Element>(d.body),
        final = {} as any,
        args  = new WeakMap(),
        outs  = new WeakMap().set(d.body, final);

  while (MutableList.tail(stack)) {
    const node = MutableList.pop(stack)!,
          out  = outs.get(node);

    switch (node._tag) {
      case TEXT_NODE: {
        if (!node.text) {
          continue;
        }
        encodeText(node, out);
        continue;
      }
      case LIST_NODE:
      case FRAGMENT:
      case FUNCTIONAL: {
        if (!node.children) {
          continue;
        }
        for (const c of node.children.toReversed()) {
          outs.set(c, out);
          MutableList.append(stack, c);
        }
        if (node._tag === FUNCTIONAL) {
          // todo
        }
        continue;
      }
      case INTRINSIC: {
        if (args.has(node)) {
          encodeRest(node, out, args.get(node)!);
          continue;
        }
        if (!node.children || node.children.length === 0) {
          encodeRest(node, out, {});
          continue;
        }
        const arg = {};
        args.set(node, arg);
        MutableList.append(stack, node);

        for (const c of node.children.toReversed()) {
          outs.set(c, arg);
          MutableList.append(stack, c);
        }
      }
    }
  }
  for (const key of Object.keys(final)) {
    if (final[key]) {
      return {
        _tag    : key,
        hydrator: d.trie,
        data    : final[key][0],
      };
    }
  }
  return null;
});
