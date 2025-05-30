import * as Diff from '#src/disreact/mode/util/diff.ts';
import * as El from '#src/disreact/mode/entity/el.ts';
import * as FC from '#src/disreact/mode/entity/fc.ts';
import * as Polymer from '#src/disreact/mode/entity/polymer.ts';
import * as Rehydrant from '#src/disreact/mode/entity/rehydrant.ts';
import * as Hook from '#src/disreact/mode/hook.ts';
import * as Progress from '#src/disreact/mode/util/progress.ts';
import {RehydrantDOM} from '#src/disreact/mode/RehydrantDOM.ts';
import {Rehydrator} from '#src/disreact/mode/Rehydrator.ts';
import * as Stack from '#src/disreact/mode/util/stack.ts';
import * as Array from 'effect/Array';
import * as Data from 'effect/Data';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';
import * as StackV1 from 'effect/MutableList';
import * as P from 'effect/Predicate';
import console from 'node:console';

export namespace Lifecycle {}

const connect = (nd: El.Nd, rs: El.Cs = nd.nodes): El.El[] => {
  const cs = Array.ensure(rs).flat();
  const rests = {} as Record<string, number>;
  const comps = new WeakMap<FC.FC, number>();

  for (let i = 0; i < cs.length; i++) {
    const c = cs[i];
    if (!El.isElem(c)) {
      const temp = El.text(c);
      temp.pos = i;
      cs[i] = temp;
      continue;
    }
    c.pos = i;
    if (El.isText(c)) {
      continue;
    }
    else if (El.isRest(c)) {
      const idx = rests[c.type] ??= 0;
      c.pos = i;
      c.idx = idx;
      c.ids = `${nd.name}:${nd.idx}:${c.name}:${c.idx}`;
      c.idn = `${nd.idn}:${c.type}:${idx}`;
      rests[c.type]++;
    }
    else {
      const idx = comps.get(c.type) ?? 0;
      c.pos = i;
      c.idx = idx;
      c.ids = `${nd.name}:${nd.idx}:${c.name}:${c.idx}`;
      c.idn = `${nd.idn}:${c.name}:${c.idx}`;
      comps.set(c.type, idx + 1);
    }
  }
  return Data.array(cs) as El.El[];
};

export class UpdateError extends Data.TaggedError('UpdateError')<{
  root : Rehydrant.Rehydrant;
  node : El.Comp;
  cause: Error;
}> {}

const renderUpdate = (root: Rehydrant.Rehydrant, node: El.Comp) =>
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
      new UpdateError({
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
    E.flatMap(() => {
      Hook.set(root, node);
      return pipe(
        FC.render(node.type),
        E.tap(() => {
          Hook.reset();
          return LOCK.release(1);
        }),
        E.map((rendered) => connect(node, rendered)),
      );
    }),
    E.catchAllDefect((cause) => {
      Hook.reset();
      console.log(cause);
      return pipe(
        LOCK.release(1),
        E.flatMap(() =>
          new RenderError({
            root : root,
            node : node,
            cause: cause as Error,
          }),
        ),
      );
    }),
    E.tap(() => renderUpdate(root, node)),
  );

export const initialize = (root: Rehydrant.Rehydrant) => E.suspend(() => {
  const stack = StackV1.make<El.Nd>(root.elem);

  const body = () => {
    const node = StackV1.pop(stack)!;
    connect(node);

    if (!El.isComp(node)) {
      for (let i = 0; i < node.nodes.length; i++) {
        const c = node.nodes[i];
        StackV1.append(stack, c);
      }
      return E.void;
    }

    return pipe(
      renderNode(root, node),
      E.map((rendered) => {
        for (let i = 0; i < rendered.length; i++) {
          const r = rendered[i];
          StackV1.append(stack, r);
        }
        node.nodes = rendered;
      }),
    );
  };

  return pipe(
    E.whileLoop({
      while: () => !!StackV1.tail(stack),
      step : () => {},
      body,
    }),
    E.as(root),
  );
});

export class EncodingError extends Data.TaggedError('EncodingError')<{
  root : Rehydrant.Rehydrant | null;
  cause: Error;
}> {}

export const encode = (root: Rehydrant.Rehydrant | null) =>
  pipe(
    Rehydrator.use((rehydrator) => {
      if (!root) {
        return null;
      }
      const primitive = rehydrator.primitive;
      const normalization = rehydrator.normalization;
      const encoding = rehydrator.encoding;

      const stack = Stack.make(root.elem);
      const args = new WeakMap();
      const outs = new WeakMap();
      const last = {} as any;
      outs.set(root.elem, last);

      while (Stack.check(stack)) {
        const node = Stack.pop(stack);
        const out = outs.get(node);

        if (El.isComp(node)) {
          for (const n of node.nodes) {
            outs.set(n, out);
            Stack.push(stack, n);
          }
        }
        else if (El.isText(node)) {
          out[primitive] ??= [];
          out[primitive].push(node.value);
        }
        else if (args.has(node)) {
          const norm = normalization[node.type];
          out[norm] ??= [];
          out[norm].push((encoding[node.type](node, args.get(node)!)));
        }
        else if (node.nodes.length === 0) {
          const norm = normalization[node.type];
          out[norm] ??= [];
          out[norm].push((encoding[node.type](node, {})));
        }
        else {
          const arg = {};
          args.set(node, arg);
          Stack.push(stack, node);
          for (const child of node.nodes) {
            outs.set(child, arg);
            Stack.push(stack, child);
          }
        }
      }
      for (const key of Object.keys(last)) {
        if (last[key]) {
          return {
            _tag    : key,
            hydrator: Rehydrant.hydrator(root),
            data    : last[key][0],
          };
        }
      }
      return null;
    }),
    E.catchAllDefect((cause) =>
      new EncodingError({
        root : root,
        cause: cause as Error,
      }),
    ),
  );

export const rehydrate = (root: Rehydrant.Rehydrant) => E.suspend(() => {
  const stack = StackV1.make<El.Nd>(root.elem);

  const body = () => {
    const next = StackV1.pop(stack)!;
    connect(next);

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
              StackV1.append(stack, child);
            }
          }
        }),
      );
    }

    for (let i = 0; i < next.nodes.length; i++) {
      const child = next.nodes[i];
      if (!El.isText(child)) {
        StackV1.append(stack, child);
      }
    }

    return E.void;
  };

  return pipe(
    E.whileLoop({
      while: () => !!StackV1.tail(stack),
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

const renderEvent = (root: Rehydrant.Rehydrant, node: El.Rest, event: El.Event) =>
  pipe(
    E.suspend(() => {
      const handler = node.handler;
      if (!handler) {
        throw new Error('Target element has no handler');
      }
      if (handler.constructor.name === 'AsyncFunction') {
        return E.promise(async () => await handler(event)) as E.Effect<void>;
      }
      const output = handler(event);
      if (!output) {
        return E.void;
      }
      if (P.isPromise(output)) {
        return E.promise(async () => await output);
      }
      return output as E.Effect<void>;
    }),
    E.flatMap(() => {
      if (root.next.id === null) {
        return pipe(
          RehydrantDOM.send(Progress.exit()),
          E.as(null),
        );
      }
      if (root.next.id === root.id) {
        return pipe(
          RehydrantDOM.send(Progress.same()),
          E.as(root),
        );
      }
      return pipe(
        RehydrantDOM.send(Progress.next(root.next.id)),
        E.flatMap(() => Rehydrator.checkout(root.next.id!, root.next.props, root.data)),
      );
    }),
    E.flatMap((next) => RehydrantDOM.finalize(next)),
    E.catchAllDefect((cause) =>
      new EventInvokeError({
        root : root,
        node : node,
        event: event,
        cause: cause as Error,
      }),
    ),
  );

export const invoke = (root: Rehydrant.Rehydrant, event: El.Event) =>
  pipe(
    E.sync(() => {
      const stack = Stack.make(root.elem);

      let target: El.Rest | undefined;

      while (Stack.check(stack)) {
        const node = Stack.pop(stack)!;

        if (El.isText(node)) {
          continue;
        }
        if (El.isRest(node)) {
          if (node.props.custom_id === event.id || node.ids === event.id) {
            target = node;
            break;
          }
        }
        for (let i = 0; i < node.nodes.length; i++) {
          const child = node.nodes[i];
          if (!El.isText(child)) {
            Stack.push(stack, child);
          }
        }
      }
      if (!target) {
        throw new Error('Event target does not exist');
      }

      return target;
    }),
    E.flatMap((target) => renderEvent(root, target, event)),
    E.as(root),
    E.catchAllDefect((cause) =>
      new EventInvokeError({
        root : root,
        event: event,
        cause: cause as Error,
      }),
    ),
  );

const mount = (root: Rehydrant.Rehydrant, node: El.El) => E.suspend(() => {
  const stack = Stack.make(node);

  const body = () => {
    const next = Stack.pop(stack)!;

    if (El.isText(next)) {
      return E.void;
    }
    connect(next);

    if (!El.isComp(next)) {
      for (let i = 0; i < next.nodes.length; i++) {
        const c = next.nodes[i];
        Stack.push(stack, c);
      }
      return E.void;
    }

    return pipe(
      renderNode(root, next),
      E.map((rendered) => {
        for (let i = 0; i < rendered.length; i++) {
          const r = rendered[i];
          Stack.push(stack, r);
        }
        next.nodes = rendered;
      }),
    );
  };

  return pipe(
    E.whileLoop({
      while: () => Stack.check(stack),
      step : () => {},
      body,
    }),
    E.as(node),
  );
});

export const rerender = (root: Rehydrant.Rehydrant) => E.gen(function* () {
  const stack = El.stack();
  const initial = yield* renderNode(root, root.elem);
  Diff.diffs(root.elem, initial);
  El.push(stack, root.elem);

  while (El.tail(stack)) {
    const node = El.pop(stack);

    if (El.isText(node)) {
      continue;
    }
    connect(node);
    const diffs = Diff.getDiffs(node);

    if (!diffs) {
      continue;
    }

    for (let i = 0; i < diffs.length; i++) {
      const diff = diffs[i];
      const child = node.nodes[i];
      if (Diff.isSkip(diff)) {
        continue;
      }
      else if (Diff.isUpdate(diff)) {
        const updated = diff.node;
        if (El.isText(updated)) {
          node.nodes[i] = updated;
        }
        else {
          Diff.diffs(child as El.Comp, updated.nodes);
          El.push(stack, child);
        }
      }
      else if (Diff.isRender(diff)) {
        const rendered = yield* renderNode(root, child as El.Comp);
        Diff.diffs(child as El.Comp, rendered);
        El.push(stack, child);
      }
      else if (Diff.isReplace(diff)) {
        node.nodes[i] = yield* mount(root, diff.node);
      }
      else if (Diff.isInsert(diff)) {
        const insertion = yield* mount(root, diff.node);
        El.insertNode(node, insertion);
      }
      else if (Diff.isRemove(diff)) {
        El.removeNode(node, i);
      }
    }
  }

  return root;
});
