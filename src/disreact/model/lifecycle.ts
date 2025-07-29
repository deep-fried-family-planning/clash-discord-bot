import * as JsxDefault from '#disreact/adaptor/codec/intrinsic/index.ts';
import {Codec} from '#disreact/model/core/Codec.ts';
import type * as Patch from '#disreact/model/core/Patch.ts';
import * as Stack from '#disreact/model/core/Stack.ts';
import type * as Elem from '#disreact/model/entity/Element.ts';
import * as Element from '#disreact/model/entity/Element.ts';
import * as Envelope from '#disreact/model/entity/Envelope.ts';
import * as Hydrant from '#disreact/model/entity/Hydrant.ts';
import type * as Jsx from '#disreact/runtime/Jsx.tsx';
import * as Hooks from '#disreact/runtime/Hook.ts';
import * as Array from 'effect/Array';
import * as Effect from 'effect/Effect';
import * as Either from 'effect/Either';
import {pipe} from 'effect/Function';
import * as GlobalValue from 'effect/GlobalValue';
import * as Option from 'effect/Option';
import * as Record from 'effect/Record';

const mutex = GlobalValue.globalValue(
  Symbol.for('disreact/mutex'),
  () => Effect.unsafeMakeSemaphore(1),
);

const take = mutex.take(1);

const acquireGlobalHooks = (el: Element.Element) =>
  Effect.map(take, () => {
    Hooks.active.polymer = el.polymer;
    return el;
  });

const releaseGlobalHooks = Effect.andThen(
  Effect.sync(() => {
    Hooks.active.polymer = undefined;
  }),
  mutex.release(1),
);

const initializeElement = (elem: Element.Element) =>
  elem.pipe(
    Element.initialize,
    acquireGlobalHooks,
    Effect.andThen(Element.render(elem)),
    Effect.ensuring(releaseGlobalHooks),
    Effect.map(Element.bindRenderedJsx(elem)),
    Effect.tap(Element.flushEffects(elem)),
  );

export const initializeCycle = (env: Envelope.Envelope) =>
  env.root.pipe(
    Stack.make,
    Stack.storePassing((elem, stack) =>
      elem.pipe(
        Element.eitherComponent,
        Either.map(initializeElement),
        Either.mapLeft(Effect.succeed),
        Either.merge,
        Effect.map(Element.nextChildren),
        Effect.map(Stack.pushAllInto(stack)),
      ),
    ),
    Effect.tap(
      Effect.map(encodeCycle(env), Envelope.addSnapshot(env)),
    ),
    Effect.as(env),
  );

const hydrateElement = (elem: Element.Element) =>
  elem.pipe(
    Element.hydrate(elem.env.curr),
    acquireGlobalHooks,
    Effect.andThen(Element.render(elem)),
    Effect.ensuring(releaseGlobalHooks),
    Effect.map(Element.bindRenderedJsx(elem)),
  );

export const hydrateCycle = (env: Envelope.Envelope) =>
  env.root.pipe(
    Stack.make,
    Stack.storePassing((elem, stack) =>
      elem.pipe(
        Element.eitherComponent,
        Either.map(hydrateElement),
        Either.mapLeft(Effect.succeed),
        Either.merge,
        Effect.map(Element.nextChildren),
        Effect.map(Stack.pushAllInto(stack)),
      ),
    ),
    // todo assert hydration
    Effect.tap(
      Effect.map(encodeCycle(env), Envelope.addSnapshot(env)),
    ),
    Effect.as(env),
  );

export const dispatchCycle = (env: Envelope.Envelope, event: Hydrant.Event) => Effect.suspend(() =>
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
    Effect.as(env),
  ),
);

const mountElement = (elem: Element.Element) =>
  elem.pipe(
    Element.initialize,
    acquireGlobalHooks,
    Effect.andThen(Element.render(elem)),
    Effect.ensuring(releaseGlobalHooks),
    Effect.map(Element.bindRenderedJsx(elem)),
    Effect.tap(Element.flushEffects(elem)),
  );

const mountSubcycle = (root: Element.Element) =>
  root.pipe(
    Stack.make,
    Stack.storePassing((elem, stack) =>
      elem.pipe(
        Element.eitherComponent,
        Either.map(mountElement),
        Either.mapLeft(Effect.succeed),
        Either.merge,
        Effect.map(Element.nextChildren),
        Effect.map(Stack.pushAllInto(stack)),
      ),
    ),
    Effect.map(Stack.root),
  );

const unmountSubcycle = (root: Element.Element) => Effect.suspend(() =>
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

const patchCycle = (root: Patch.Changeset<Element.Element>) =>
  root.pipe(
    Stack.make,
    Stack.storePassing((changes, stack) =>
      pipe(
        Effect.forEach(
          changes.mount,
          mountSubcycle,
        ),
        Effect.tap(Effect.forEach(
          changes.unmount,
          unmountSubcycle,
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
    Element.eitherComponent,
    Either.match({
      onRight: Array.ensure,
      onLeft : Element.lowerBoundary,
    }),
    Effect.forEach(rerenderElement),
    Effect.andThen(
      Effect.forEach(patchCycle),
    ),
    Effect.as(root.env),
    Effect.tap((env) =>
      env.pipe(
        encodeCycle,
        Effect.map(Envelope.addSnapshot(env)),
      ),
    ),
  );

export const rerenderCycle = (env: Envelope.Envelope) =>
  pipe(
    Element.lowestCommonAncestor(env.flags),
    Option.getOrElse(() => env.root),
    rerenderSubcycle,
  );

const purgeUndefinedKeys = <A extends Record<string, any>>(obj: A): A =>
  Record.filter(obj, (k, v) => v !== undefined) as A;

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

export const encodeCycle = (env: Envelope.Envelope) => Effect.sync(() =>
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

      return Hydrant.toSnapshot(state.hydrator, '', key, final[key][0]);
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

export const bootstrapFC = <P, D>(fc: Jsx.FC<P>, props: P, data?: D) =>
  pipe(
    Hydrant.fromRegistry(fc, props),
    Effect.flatMap(Envelope.make(data)),
    Effect.flatMap(initializeCycle),
  );

export const bootstrapJsx = <D>(root: Jsx.Jsx, data?: D) =>
  pipe(
    Hydrant.fromRegistry(root),
    Effect.flatMap(Envelope.make(data)),
  );

export const rehydrate = <D>(hydrator: Hydrant.Hydrator, event: Hydrant.Event, data?: D) =>
  pipe(
    Hydrant.fromHydrator(hydrator),
    Effect.flatMap(Envelope.make(data)),
    Effect.tap((env) =>
      hydrateCycle(env).pipe(
        Effect.andThen(dispatchCycle(env, event)),
        Effect.flatMap(() => Effect.void),
        Effect.fork,
      ),
    ),
  )
;
