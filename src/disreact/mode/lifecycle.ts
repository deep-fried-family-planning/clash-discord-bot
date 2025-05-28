import {Dispatcher} from '#src/disreact/mode/Dispatcher.ts';
import * as El from '#src/disreact/mode/entity/el.ts';
import * as Polymer from '#src/disreact/mode/entity/polymer.ts';
import * as Fibril from '#src/disreact/mode/entity/polymer.ts';
import type * as Rehydrant from '#src/disreact/mode/entity/rehydrant.ts';
import type {Hook} from '#src/disreact/mode/hook.ts';
import {Progress, RehydrantDOM} from '#src/disreact/mode/RehydrantDOM.ts';
import {RehydrantEncoder} from '#src/disreact/mode/RehydrantEncoder.ts';
import * as Array from 'effect/Array';
import * as Data from 'effect/Data';
import * as E from 'effect/Effect';
import * as Equal from 'effect/Equal';
import {pipe} from 'effect/Function';
import * as Stack from 'effect/MutableList';
import * as Option from 'effect/Option';
import * as P from 'effect/Predicate';

export class EffectHookError extends Data.TaggedError('EffectHookError')<{
  cause: Error;
}> {}

const renderEffectHook = (effect: Hook.Effect) =>
  pipe(
    E.suspend(() => {
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
    E.catchAllDefect((cause) => new EffectHookError({cause: cause as Error})),
  );

export const rendering = (root: Rehydrant.Rehydrant) => Dispatcher.use((dispatcher) => {
  return E.succeed(root);
});

export const rerender = (root: Rehydrant.Rehydrant) => E.gen(function* () {
  const stack = Stack.empty<[El.Node, El.El[]]>();
  const hasSentPartial = false;

  const initial = yield* Dispatcher.render(root, root.elem);
  Stack.append(stack, [root.elem, initial]);

  while (Stack.tail(stack)) {
    const [parent, rs] = Stack.pop(stack)!;
    const maxlen = Math.max(parent.nds.length, rs.length);

    for (let i = 0; i < maxlen; i++) {
      const current = parent.nds[i];
      const rendered = rs[i];

      if (!current) {
        if (El.isText(rendered)) {
          parent.nds[i] = rendered;
        }
        else {
          parent.nds[i] = yield* mount(root, rendered);
        }
      }
      else if (!rendered) {
        if (El.isText(current)) {
          parent.nds.splice(i, 1);
        }
        else {
          yield* dismount(root, current);
          parent.nds.splice(i, 1);
        }
      }

      else if (El.isText(current)) {
        if (El.isText(rendered)) {
          if (!Equal.equals(current, rendered)) {
            parent.nds[i] = rendered;
          }
        }
        else {
          parent.nds[i] = yield* mount(root, rendered);
        }
      }
      else if (El.isRest(current)) {
        if (!hasSentPartial) {
          // hasSentPartial = yield* relayPartial(curr);
        }
        if (El.isText(rendered)) {
          yield* dismount(root, current);
          parent.nds[i] = rendered;
        }
        else if (El.isRest(rendered)) {
          if (!Equal.equals(current.type, rendered.type)) {
            yield* dismount(root, current);
            parent.nds[i] = yield* mount(root, rendered);
            yield* sendPartial(root, rendered);
          }
          if (!Equal.equals(current.props, rendered.props)) {
            current.props = rendered.props;
          }
          Stack.append(stack, [current, rendered.nds]);
        }
        else {
          yield* dismount(root, current);
          parent.nds[i] = yield* mount(root, rendered);
        }
      }
      else {
        const fibril = Fibril.get(current);
        if (El.isText(rendered)) { // Task => Primitive
          yield* dismount(root, current);
          parent.nds[i] = rendered;
        }
        else if (El.isRest(rendered) || !Equal.equals(current.idn, rendered.idn)) { // Task => Rest or Task => Task
          yield* dismount(root, current);
          parent.nds[i] = yield* mount(root, rendered);
        }
        else if (
          Equal.equals(current.props, rendered.props) && // Task Changed
          Equal.equals(fibril.stack, fibril.saved)
        ) {
          // Stack.append(stack, [curr, rend.nodes]);
        }
        else {
          const rerendered = yield* Dispatcher.render(root, current);
          Stack.append(stack, [current, rerendered]);
        }
      }
    }
  }

  return root;
});

export const invoke = (root: Rehydrant.Rehydrant, event: El.Event) => E.suspend(() => {
  const stack = Stack.make<El.Node>(root.elem);

  while (Stack.tail(stack)) {
    const next = Stack.pop(stack)!;

    if (El.isText(next)) {
      continue;
    }

    if (El.isRest(next)) {
      if (next.props.custom_id === event.id || next.ids === event.id) {
        return pipe(
          El.invoke(next, event),
          E.flatMap(() => {
            if (root.next.id === null) {
              return RehydrantDOM.send(Progress.Close());
            }
            if (root.next.id !== root.id) {
              return RehydrantDOM.send(Progress.Next({id: root.next.id}));
            }
            return RehydrantDOM.send(Progress.Same());
          }),
        );
      }
    }

    for (let i = 0; i < next.nds.length; i++) {
      const node = next.nds[i];

      if (!El.isText(node)) {
        Stack.append(stack, next.nds[i]);
      }
    }
  }

  return E.fail(new Error('Event not handled'));
}).pipe(E.as(root));

export const rehydrate = (root: Rehydrant.Rehydrant) => Dispatcher.use((dispatcher) => {
  const stack = Stack.make<El.Node>(root.elem);

  return E.whileLoop({
    while: () => !!Stack.tail(stack),
    step : () => {},
    body : () => {
      const next = Stack.pop(stack)!;

      if (El.isComp(next)) {
        const fibril = root.poly[next.idn!];

        if (fibril) {
          Fibril.set(next, fibril);
        }

        return pipe(
          dispatcher.render(root, next),
          E.map((rendered) => {
            next.nds = rendered;

            for (let i = 0; i < next.nds.length; i++) {
              const child = next.nds[i];

              if (!El.isText(child)) {
                El.connect(next, child, i);
                Stack.append(stack, child);
              }
            }
          }),
        );
      }

      for (let i = 0; i < next.nds.length; i++) {
        const child = next.nds[i];

        if (!El.isText(child)) {
          El.connect(next, child, i);
          Stack.append(stack, child);
        }
      }

      return E.void;
    },
  }).pipe(E.as(root));
});

export const initialize = (root: Rehydrant.Rehydrant) =>
  pipe(
    mount(root, root.elem),
    E.as(root),
  );

const mount = (root: Rehydrant.Rehydrant, nd: El.Node) => Dispatcher.use((dispatcher) => {
  const stack = El.stack(nd);

  return E.whileLoop({
    while: () => El.check(stack),
    step : () => {},
    body : () => E.suspend(() => {
      const next = El.pop(stack)!;

      if (El.isComp(next)) {
        return pipe(
          dispatcher.render(root, next),
          E.map((rendered) => {
            next.nds = rendered;
            El.pushConnect(stack, next);
          }),
        );
      }
      El.pushConnect(stack, next);
      return sendPartial(root, next);
    }),
  }).pipe(E.as(nd));
});

const dismount = (root: Rehydrant.Rehydrant, nd: El.Node) => {
  const stack = El.stack(nd);

  return E.whileLoop({
    while: () => El.check(stack),
    step : () => {},
    body : () => E.suspend(() => {
      const next = El.pop(stack)!;

      if (El.isComp(next)) {
        Fibril.dismount(next);
      }
      El.push(stack, next);
      return E.void;
    }),
  });
};

const flush = (effect: Hook.Effect) => E.suspend(() => {
  const out = effect();

  if (P.isPromise(out)) {
    return E.promise(async () => await out) as E.Effect<void>;
  }
  if (E.isEffect(out)) {
    return out as E.Effect<void>;
  }
  return E.void as E.Effect<void>;
});

const sendPartial = (root: Rehydrant.Rehydrant, node: El.Rest) =>
  RehydrantEncoder.use((codec) => {
    if (node.type in codec.partials) {
      return RehydrantDOM.send(
        codec.partials[node.type](root.id, node.type, node.props),
      );
    }
    return E.void;
  });
