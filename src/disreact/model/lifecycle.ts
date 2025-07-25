import * as JsxDefault from '#disreact/adaptor/codec/intrinsic/index.ts';
import {Codec} from '#disreact/model/core/Codec.ts';
import type * as Patch from '#disreact/model/core/Patch.ts';
import * as Stack from '#disreact/model/core/Stack.ts';
import type * as Elem from '#disreact/model/entity/Element.ts';
import * as Element from '#disreact/model/entity/Element.ts';
import * as Envelope from '#disreact/model/entity/Envelope.ts';
import * as Hydrant from '#disreact/model/entity/Hydrant.ts';
import * as Polymer from '#disreact/model/entity/Polymer.ts';
import * as Hooks from '#disreact/runtime/Hook.ts';
import * as Array from 'effect/Array';
import * as Effect from 'effect/Effect';
import * as Either from 'effect/Either';
import {flow, pipe} from 'effect/Function';
import * as GlobalValue from 'effect/GlobalValue';
import * as Option from 'effect/Option';
import * as Record from 'effect/Record';

const mutex = GlobalValue.globalValue(
  Symbol.for('disreact/mutex'),
  () => Effect.unsafeMakeSemaphore(1),
);

const take = mutex.take(1);

const acquireGlobalHooks = (el: Element.Element) =>
  take.pipe(
    Effect.map(() => {
      Hooks.active.polymer = el.polymer;
      return el;
    }),
  );

const releaseGlobalHooks = Effect.andThen(
  Effect.sync(() => {
    Hooks.active.polymer = undefined;
  }),
  mutex.release(1),
);

const initializeElement = (elem: Element.Element) =>
  elem.pipe(
    Element.mount(Polymer.make(elem)),
    acquireGlobalHooks,
    Effect.andThen(Element.render(elem)),
    Effect.ensuring(releaseGlobalHooks),
    Effect.map(Element.bindRenderedJsx(elem)),
    Effect.tap(Element.flushEffects(elem)),
  );

export const initializeCycle = (env: Envelope.Envelope) =>
  pipe(
    Stack.make(env.root),
    Stack.iterate((elem) =>
      elem.pipe(
        Element.either,
        Either.map(initializeElement),
        Either.mapLeft(Effect.succeed),
        Either.merge,
        Effect.map(Element.nextChildren),
      ),
    ),
    Effect.as(env),
    Effect.tap(
      Effect.map(
        encode(env),
        Envelope.addSnapshot(env),
      ),
    ),
  );

const hydrateElement = (elem: Element.Element) =>
  elem.env.curr.pipe(
    Hydrant.pullState(elem.trie),
    Option.map((encoded) => Polymer.make(elem).pipe(Polymer.hydrate2(encoded))),
    Option.getOrElse(() => Polymer.make(elem)),
    Element.mountInto(elem),
    acquireGlobalHooks,
    Effect.andThen(Element.render(elem)),
    Effect.ensuring(releaseGlobalHooks),
    Effect.map(Element.bindRenderedJsx(elem)),
    Effect.tap(Element.flushEffects(elem)),
  );

export const hydrateCycle = (env: Envelope.Envelope) =>
  env.root.pipe(
    Stack.make,
    Stack.storePassing((elem, stack) =>
      elem.pipe(
        Element.either,
        Either.map(hydrateElement),
        Either.mapLeft(Effect.succeed),
        Either.merge,
        Effect.map(Element.nextChildren),
        Effect.map(Stack.pushAllInto(stack)),
      ),
    ),
    // todo assert hydration
    Effect.as(env),
    Effect.tap(
      Effect.map(
        encode(env),
        Envelope.addSnapshot(env),
      ),
    ),
  );

export const dispatch = (env: Envelope.Envelope, event: Hydrant.Event) =>
  env.root.pipe(
    Element.findChild((child) => {
      if (!Element.isIntrinsic(child)) {
        return Option.none();
      }
      if (child.step !== event.id || child.props.custom_id !== event.id) {
        return Option.none();
      }
      return Option.some(child);
    }),
    Effect.flatMap(
      Element.trigger(Envelope.bindEvent(env, event)),
    ),
  );

const rerenderElement = (elem: Element.Element) =>
  elem.pipe(
    acquireGlobalHooks,
    Effect.andThen(Element.render(elem)),
    Effect.ensuring(releaseGlobalHooks),
    Effect.map((rendered) =>
      pipe(
        Element.fromRender(rendered, elem),
        Element.diffs(elem),
        Element.delta(elem),
      ),
    ),
    Effect.tap(Element.flushEffects(elem)),
  );

const mountElement = (elem: Element.Element) =>
  elem.pipe(
    Element.mount(Polymer.make(elem)),
    acquireGlobalHooks,
    Effect.andThen(Element.render(elem)),
    Effect.ensuring(releaseGlobalHooks),
    Effect.map(Element.bindRenderedJsx(elem)),
    Effect.tap(Element.flushEffects(elem)),
  );

const mountStack = (root: Element.Element) =>
  root.pipe(
    Stack.make,
    Stack.storePassing((elem, stack) =>
      elem.pipe(
        Element.either,
        Either.match({
          onRight: mountElement,
          onLeft : Effect.succeed,
        }),
        Effect.map(Element.nextChildren),
        Effect.map(Stack.pushAllInto(stack)),
      ),
    ),
  );

const unmountStack = (root: Element.Element) =>
  root.pipe(
    Stack.makeWithState(new WeakSet()),
    Stack.storePassingSync((cur, stack, visited) => {
      if (visited.has(cur)) {
        Element.release(cur);
        return stack;
      }
      visited.add(cur);
      return cur.pipe(
        Element.nextChildren,
        Stack.pushAllInto(stack),
      );
    }),
    Effect.succeed,
  );

const patchCycle = (root: Patch.Changeset<Element.Element>) =>
  root.pipe(
    Stack.make,
    Stack.storePassing((changes, stack) =>
      pipe(
        Effect.forEach(
          changes.mount,
          mountStack,
        ),
        Effect.tap(Effect.forEach(
          changes.unmount,
          unmountStack,
        )),
        Effect.andThen(Effect.forEach(
          changes.render,
          rerenderElement,
        )),
        Effect.map(Stack.pushAllInto(stack)),
      ),
    ),
  );

const rerenderSubcycle = (root: Element.Element) =>
  root.pipe(
    Element.either,
    Either.match({
      onRight: Array.ensure,
      onLeft : Element.lowerBoundary,
    }),
    Effect.forEach(rerenderElement, {batching: true}),
    Effect.andThen(
      Effect.forEach(patchCycle, {batching: true}),
    ),
    Effect.as(root.env),
    Effect.tap((env) =>
      env.pipe(
        encode,
        Effect.map(Envelope.addSnapshot(env)),
      ),
    ),
  );

export const rerender = (env: Envelope.Envelope) =>
  pipe(
    Element.lowestCommonAncestor(env.flags),
    Option.getOrElse(() => env.root),
    rerenderSubcycle,
  );

const purgeUndefinedKeys = <A extends Record<string, any>>(obj: A): A => Record.filter(obj, (k, v) => v !== undefined) as A;

const primitive = JsxDefault.primitive,
      normalize = JsxDefault.normalization as Record<string, string>,
      encoders  = JsxDefault.encoding as Record<string, (self: any, acc: any) => any>;

const encodeText = (node: Elem.Element, acc: any) => {
  if (!node.text) {
    return acc;
  }
  acc[primitive] ??= [];
  acc[primitive].push(node.text);
  return acc;
};

const encodeIntrinsic = (node: Elem.Element, acc: any, arg: any) => {
  const key = normalize[node.type];
  const encoder = encoders[node.type];
  if (!encoder) {
    throw new Error();
  }
  const encoded = encoder(node, arg);
  acc[key] ??= [];
  acc[key].push(purgeUndefinedKeys(encoded));
  return acc;
};

export const encode = (env: Envelope.Envelope) => Effect.sync(() =>
  env.root.pipe(
    Stack.make,
    Stack.setState({
      hydrator: Hydrant.toHydrator(env.curr),
      args    : new WeakMap(),
      outs    : new WeakMap().set(env.root, {}),
    }),
    Stack.storePassingSync((elem, stack) => {
      const {args, outs} = Stack.state(stack);
      const out = outs.get(elem);

      switch (elem._tag) {
        case 'Text': {
          encodeText(elem, out);
          return stack;
        }
        case 'Intrinsic': {
          if (!args.has(elem)) {
            const arg = {};
            args.set(elem, arg);

            return stack.pipe(
              Stack.push(elem),
              Stack.tapPushAll(elem.children, (c) => outs.set(c, arg)),
            );
          }
          if (!elem.children || elem.children.length === 0) {
            encodeIntrinsic(elem, out, {});
            return stack;
          }
          encodeIntrinsic(elem, out, args.get(elem)!);
          return stack;
        }
        case 'Component': {
          // todo state hydrator
        }
      }
      return Stack.tapPushAll(stack, elem.children, (c) => outs.set(c, out));
    }),
    Stack.modifyState((state) => {
      const final = state.outs.get(env.root)!;
      const key = Object.keys(final)[0];

      return Hydrant.snapshot(state.hydrator, '', key, final[key][0]);
    }),
    Stack.state,
  ),
);

export const encode123 = (root: Element.Element) => Codec.use(({encodeText, encodeRest}) => {
  const stack = [root.env.root],
        final = {} as any,
        args  = new WeakMap(),
        outs  = new WeakMap().set(root.env.root, final);

  while (stack.length) {
    const cur = stack.pop()!,
          out = outs.get(cur);

    switch (cur._tag) {
      case Element.TEXT: {
        if (!cur.text) {
          continue;
        }
        encodeText(cur as Element.Text, out);
        continue;
      }
      case Element.FRAGMENT:
      case Element.COMPONENT: {
        if (!cur.children) {
          continue;
        }
        for (const c of cur.children.toReversed()) {
          outs.set(c, out);
          stack.push(c);
        }
      }
      case Element.INTRINSIC: {
        if (args.has(cur)) {
          encodeRest(cur as Element.Intrinsic, out, args.get(cur)!);
          continue;
        }
        if (!cur.children || cur.children.length === 0) {
          encodeRest(cur as Element.Intrinsic, out, {});
          continue;
        }
        const arg = {};
        args.set(cur, arg);
        stack.push(cur);

        for (const c of cur.children.toReversed()) {
          outs.set(c, arg);
          stack.push(cur);
        }
      }
    }
  }
  const keys = Object.keys(final);

  if (keys.length === 0) {
    return null;
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

const mount = (start: Element.Element) =>
  pipe(
    Effect.iterate(Stack.make(start), {
      while: Stack.condition,
      body : (stack) =>
        stack.pipe(
          Stack.pop,
          Element.either,
          Either.map(mountElement),
          Either.mapLeft(Effect.succeed),
          Either.merge,
          Effect.map(flow(
            Element.nextChildren,
            Stack.pushAllInto(stack),
            Stack.iterateSyncWhile((el) => {
              if (Element.isComponent(el)) {
                return Option.none();
              }
              return Option.some(el.children);
            }),
          )),
        ),
    }),
    Effect.as(start),
  );
