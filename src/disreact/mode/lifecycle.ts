import * as Diff from '#src/disreact/mode/diff.ts';
import * as El from '#src/disreact/mode/entity/el.ts';
import * as FC from '#src/disreact/mode/entity/fc.ts';
import * as Polymer from '#src/disreact/mode/entity/polymer.ts';
import type * as Rehydrant from '#src/disreact/mode/entity/rehydrant.ts';
import * as Hook from '#src/disreact/mode/hook.ts';
import * as Progress from '#src/disreact/mode/progress.ts';
import {RehydrantDOM} from '#src/disreact/mode/RehydrantDOM.ts';
import * as Data from 'effect/Data';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';
import * as Stack from 'effect/MutableList';
import * as P from 'effect/Predicate';

export class EffectHookError extends Data.TaggedError('EffectHookError')<{
  root : Rehydrant.Rehydrant;
  node : El.Comp;
  cause: Error;
}> {}

const renderEffect = (root: Rehydrant.Rehydrant, node: El.Comp) =>
  pipe(
    E.sync(() => Polymer.get(node)),
    E.flatMap((polymer) =>
      E.forEach(polymer.queue, (effect) => {
        if (effect.constructor.name === 'AsyncFunction') {
          return E.promise(async () => await effect()) as E.Effect<void>;
        }
        const out = effect();
        if (P.isPromise(out)) {
          return E.promise(async () => await out) as E.Effect<void>;
        }
        if (E.isEffect(out)) {
          return out as E.Effect<void>;
        }
        return E.void;
      }),
    ),
    E.catchAllDefect((cause) =>
      new EffectHookError({
        root : root,
        node : node,
        cause: cause as Error,
      }),
    ),
  );

const LOCK = E.unsafeMakeSemaphore(1);

export class RenderError extends Data.TaggedError('RenderError')<{
  root : Rehydrant.Rehydrant;
  node : El.Comp;
  cause: Error;
}> {}

const renderNode = (root: Rehydrant.Rehydrant, node: El.Comp) =>
  pipe(
    LOCK.take(1),
    E.tap(() => {
      Hook.set(root, node);
      return E.void;
    }),
    E.flatMap(() => FC.render(node.type)),
    E.map((rendered) => El.normalize(node, rendered)),
    E.tap(() => {
      Hook.reset();
      return LOCK.release(1);
    }),
    E.catchAllDefect((cause) => {
      Hook.reset();
      return LOCK.release(1).pipe(E.flatMap(() =>
        new RenderError({
          root : root,
          node : node,
          cause: cause as Error,
        }),
      ));
    }),
    E.tap(() => renderEffect(root, node)),
  );

export const initialize = (root: Rehydrant.Rehydrant) => E.suspend(() => {
  const stack = Stack.make<El.Nd>(root.elem);

  const body = () => {
    const next = Stack.pop(stack)!;

    if (!El.isComp(next)) {
      for (let i = 0; i < next.nodes.length; i++) {
        const c = next.nodes[i];
        El.connect(next, c, i);
        Stack.append(stack, c);
      }
      return E.void;
    }

    return pipe(
      renderNode(root, next),
      E.map((rendered) => {
        for (let i = 0; i < rendered.length; i++) {
          const r = rendered[i];
          El.connect(next, r, i);
          Stack.append(stack, r);
        }
        next.nodes = rendered;
      }),
    );
  };

  return pipe(
    E.whileLoop({
      while: () => !!Stack.tail(stack),
      step : () => {},
      body,
    }),
    E.as(root),
  );
});

export const rehydrate = (root: Rehydrant.Rehydrant) => E.suspend(() => {
  const stack = Stack.make<El.Nd>(root.elem);

  const body = () => {
    const next = Stack.pop(stack)!;

    if (El.isComp(next)) {
      const polymer = root.poly[next.idn!];

      if (polymer) {
        Polymer.set(next, polymer);
      }

      return pipe(
        renderNode(root, next),
        E.map((rendered) => {
          next.nodes = rendered;

          for (let i = 0; i < next.nodes.length; i++) {
            const child = next.nodes[i];

            if (!El.isText(child)) {
              El.connect(next, child, i);
              Stack.append(stack, child);
            }
          }
        }),
      );
    }

    for (let i = 0; i < next.nodes.length; i++) {
      const child = next.nodes[i];

      if (!El.isText(child)) {
        El.connect(next, child, i);
        Stack.append(stack, child);
      }
    }

    return E.void;
  };

  return pipe(
    E.whileLoop({
      while: () => !!Stack.tail(stack),
      step : () => {},
      body : body,
    }),
    E.as(root),
  );
});

export class EventInvokeError extends Data.TaggedError('EventInvokeError')<{
  root : Rehydrant.Rehydrant;
  node?: El.Rest;
  event: El.Event;
  cause: Error;
}> {}

export const invoke = (root: Rehydrant.Rehydrant, event: El.Event) => E.suspend(() => {
  const stack = Stack.make<El.Nd>(root.elem);

  while (Stack.tail(stack)) {
    const node = Stack.pop(stack)!;

    if (!El.isRest(node) || (node.props.custom_id !== event.id && node.ids !== event.id)) {
      for (let i = 0; i < node.nodes.length; i++) {
        const child = node.nodes[i];
        if (!El.isText(child)) {
          Stack.append(stack, child);
        }
      }
      continue;
    }

    return pipe(
      E.suspend(() => {
        const handler = node.handler;
        if (!handler) {
          return E.die(new Error('Target element has no handler'));
        }
        if (handler.constructor.name === 'AsyncFunction') {
          return E.promise(async () => await handler(event)) as E.Effect<void>;
        }
        const output = handler(event);
        if (P.isPromise(output)) {
          return E.promise(async () => await output);
        }
        if (E.isEffect(output)) {
          return output as E.Effect<void>;
        }
        return E.void;
      }),
      E.catchAllDefect((cause) =>
        new EventInvokeError({
          root : root,
          node : node,
          event: event,
          cause: cause as Error,
        }),
      ),
      E.flatMap(() => {
        if (root.next.id === null) {
          return pipe(
            RehydrantDOM.send(Progress.exit()),
            E.tap(() => RehydrantDOM.finalize(null)),
          );
        }
        if (root.next.id !== root.id) {
          return RehydrantDOM.send(Progress.next(root.next.id));
        }
        return RehydrantDOM.send(Progress.same());
      }),
      E.as(root),
    );
  }

  return new EventInvokeError({
    root : root,
    event: event,
    cause: new Error('Event target does not exist'),
  });
});

export const rerender = (root: Rehydrant.Rehydrant) => E.gen(function* () {
  const stack = El.stack(root.elem);

  const initialRs = yield* renderNode(root, root.elem);

  Diff.children(root.elem, initialRs);
});
