import * as El from '#src/disreact/model/entity/el.ts';
import * as FC from '#src/disreact/model/entity/fc.ts';
import * as Polymer from '#src/disreact/model/entity/polymer.ts';
import * as Props from '#src/disreact/model/entity/props.ts';
import * as Rehydrant from '#src/disreact/model/entity/rehydrant.ts';
import {Relay} from '#src/disreact/model/Relay.ts';
import {Rehydrator} from '#src/disreact/model/Rehydrator.ts';
import * as Diff from '#src/disreact/model/util/diff.ts';
import * as Progress from '#src/disreact/model/util/progress.ts';
import * as Stack from '#src/disreact/model/util/stack.ts';
import {Duration} from 'effect';
import * as Array from 'effect/Array';
import * as Data from 'effect/Data';
import * as E from 'effect/Effect';
import {flow, pipe} from 'effect/Function';
import * as StackV1 from 'effect/MutableList';
import * as P from 'effect/Predicate';
import type * as Cause from 'effect/Cause';
import * as Option from 'effect/Option';
import * as Globals from '#src/disreact/model/util/globals.ts';

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
      El.setParent(temp, nd);
      continue;
    }
    c.pos = i;
    El.setParent(c, nd);
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
  return El.ns(cs) as El.El[];
};

export class UpdateDefect extends Data.TaggedError('UpdateDefect')<{
  root : Rehydrant.Rehydrant;
  node : El.Comp;
  cause: Cause.Cause<Error>;
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
    E.catchAllCause((cause) =>
      new UpdateDefect({
        root : root,
        node : node,
        cause: cause,
      }),
    ),
  );

const LOCK = E.unsafeMakeSemaphore(1);

export class RenderDefect extends Data.TaggedError('RenderDefect')<{
  root : Rehydrant.Rehydrant;
  node : El.Comp;
  cause: Cause.Cause<Error>;
}> {}

Globals.init();

const renderNode = (root: Rehydrant.Rehydrant, node: El.Comp) =>
  Globals.withLock(
    root,
    node,
    0,
    FC.render(node.type, node.props),
  ).pipe(
    E.map((rendered) => connect(node, rendered)),
    E.catchAllCause((cause) =>
      new RenderDefect({
        root : root,
        node : node,
        cause: cause,
      }),
    ),
    E.tap(() => renderUpdate(root, node)),
  );
  // pipe(
  //   Globals.set(root, node),
  //   E.andThen(),
  //   E.tap(Globals.reset),
  //   E.map((rendered) => connect(node, rendered)),
  //   E.catchAllCause((cause) =>
  //     pipe(
  //       Globals.reset,
  //       E.andThen(
  //         new RenderDefect({
  //           root : root,
  //           node : node,
  //           cause: cause,
  //         }),
  //       ),
  //     ),
  //   ),
  //
  // );

const OptionalPart = E.serviceOption(Relay).pipe(
  E.map(Option.map((relay) =>
    (id: string, type: string, props: any) => relay.send(Progress.part(id, type, props)),
  )),
  E.map(Option.getOrElse(() =>
    (...p: Parameters<typeof Progress.part>) => E.void,
  )),
);

export const initialize = (root: Rehydrant.Rehydrant) => OptionalPart.pipe(E.flatMap((part) => {
  const stack = StackV1.make<El.Nd>(root.elem);

  const body = () => {
    const node = StackV1.pop(stack)!;
    connect(node);

    if (!El.isComp(node)) {
      for (let i = 0; i < node.nodes.length; i++) {
        const c = node.nodes[i];
        if (!El.isText(c)) {
          StackV1.append(stack, c);
        }
      }
      return part(root.id, node.type, node.props);
    }

    return pipe(
      renderNode(root, node),
      E.map((rendered) => {
        for (let i = 0; i < rendered.length; i++) {
          const r = rendered[i];
          if (!El.isText(r)) {
            StackV1.append(stack, r);
          }
        }
        node.nodes = rendered;
      }),
      E.asVoid,
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
}));

export class EncodeDefect extends Data.TaggedError('EncodeDefect')<{
  root : Rehydrant.Rehydrant | null;
  cause: Cause.Cause<Error>;
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
      const seen = new WeakSet();
      const last = {} as any;
      outs.set(root.elem, last);

      while (Stack.check(stack)) {
        const n = Stack.pop(stack);
        const out = outs.get(n);

        // if (seen.has(node)) {
        //   continue;
        // }

        if (El.isComp(n)) {
          for (const c of n.nodes.toReversed()) {
            outs.set(c, out);
            Stack.push(stack, c);
          }
        }
        else if (El.isText(n)) {
          out[primitive] ??= [];
          out[primitive].push(n.value);
        }
        else if (args.has(n)) {
          const norm = normalization[n.type];
          out[norm] ??= [];
          out[norm].push((encoding[n.type](n, args.get(n)!)));
        }
        else if (n.nodes.length === 0) {
          const norm = normalization[n.type];
          out[norm] ??= [];
          out[norm].push((encoding[n.type](n, {})));
        }
        else {
          const arg = {};
          args.set(n, arg);
          Stack.push(stack, n);
          for (const child of n.nodes.toReversed()) {
            outs.set(child, arg);
            Stack.push(stack, child);
          }
        }
        seen.add(n);
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
    E.timeout(Duration.seconds(1)),
    E.catchAllCause((cause) =>
      new EncodeDefect({
        root : root,
        cause: cause,
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

export class EventDefect extends Data.TaggedError('EventDefect')<{
  root : Rehydrant.Rehydrant;
  node?: El.Rest;
  event: El.Event;
  cause: Cause.Cause<Error>;
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
        return Relay.final(Progress.exit());
      }
      if (root.next.id === root.id) {
        return Relay.final(Progress.same(root));
      }
      return Relay.final(Progress.next(root));
    }),
    E.catchAllCause((cause) =>
      new EventDefect({
        root : root,
        node : node,
        event: event,
        cause: cause,
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
    E.catchAllCause((cause) =>
      new EventDefect({
        root : root,
        event: event,
        cause: cause,
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
  const stack = Stack.make();
  const initial = yield* renderNode(root, root.elem);
  Diff.diffs(root.elem, initial);
  Stack.push(stack, root.elem);

  while (Stack.check(stack)) {
    const node = Stack.pop(stack);

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
          (node.nodes[i] as any).props = Props.make((diff.node as any).props);
          Diff.diffs(child as El.Comp, updated.nodes);
          Stack.push(stack, child);
        }
      }
      else if (Diff.isRender(diff)) {
        const rendered = yield* renderNode(root, child as El.Comp);
        Diff.diffs(child as El.Comp, rendered);
        Stack.push(stack, child);
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
