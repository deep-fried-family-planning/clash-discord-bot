import * as El from '#src/disreact/model/entity/element.ts';
import * as FC from '#src/disreact/model/entity/fc.ts';
import * as Polymer from '#src/disreact/model/entity/polymer.ts';
import * as Props from '#src/disreact/model/entity/props.ts';
import * as Rehydrant from '#src/disreact/model/entity/rehydrant.ts';
import * as Diff from '#src/disreact/model/lifecycle/diff.ts';
import * as Globals from '#src/disreact/model/entity/globals.ts';
import {Rehydrator} from '#src/disreact/model/Rehydrator.ts';
import {Relay} from '#src/disreact/model/Relay.ts';
import * as Const from '#src/disreact/model/util/const.ts';
import * as Mutex from '#src/disreact/model/util/mutex.ts';
import * as Progress from '#src/disreact/model/util/progress.ts';
import * as Stack from '#src/disreact/model/util/stack.ts';
import * as Duration from 'effect/Duration';
import * as Cause from 'effect/Cause';
import * as Data from 'effect/Data';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';
import * as MutableList from 'effect/MutableList';
import * as Option from 'effect/Option';
import * as P from 'effect/Predicate';

export type Lifecycle = {
  _tag: Const.LifecycleType;
};

interface BaseOp {
  root : Rehydrant.Rehydrant;
  node : El.Comp;
  stack: Stack.Stack;
}
type Op = BaseOp;

export class EffectDefect extends Data.TaggedError('EffectDefect')<{
  message: string;
  cause  : Cause.Cause<Error>;
  op     : Op;
}> {}

export class LifecycleDefect extends Data.TaggedError('LifecycleDefect')<{
  cause?: Cause.Cause<Error>;
  op    : Op;
}> {}

const renderEffects = (op: Op) =>
  pipe(
    E.forEach(Polymer.get(op.node).queue, (fx) => {
      if (fx.constructor.name === Const.ASYNC_FUNCTION) {
        return E.promise(fx as () => Promise<void>);
      }
      const out = fx();
      if (P.isPromise(out)) {
        return E.promise(() => out) as E.Effect<void>;
      }
      if (E.isEffect(out)) {
        return out as E.Effect<void>;
      }
      return E.void;
    }),
    E.tapErrorCause((cause) => E.logFatal(Cause.pretty(cause))),
    E.catchAllCause((cause) =>
      new EffectDefect({
        message: Cause.pretty(cause),
        cause  : cause,
        op     : op,
      }),
    ),
  );

export class RendereredDefect extends Data.TaggedError('RenderDefect')<{
  cause: Cause.Cause<Error>;
  op   : Op;
}> {}

const renderInitialize = (op: Op) =>
  pipe(
    Mutex.lock,
    E.flatMap(() => {
      Globals.set(op.root, op.node);
      return FC.render(op.node.type, op.node.props);
    }),
    E.tap(() => {
      Globals.reset();
      return Mutex.done;
    }),
  );

export class RehydrateDefect extends Data.TaggedError('RehydrateDefect')<{
  cause: Cause.Cause<Error>;
}> {}

const renderRehydrate = (rh: Rehydrant.Rehydrant, n: El.Comp) => {
  rh.polymers;
};

export class RenderDefect extends Data.TaggedError('RenderDefect')<{
  root : Rehydrant.Rehydrant;
  node : El.Comp;
  cause: Cause.Cause<Error>;
}> {}

const renderNode = (rh: Rehydrant.Rehydrant, n: El.Comp) => {
  const poly = Polymer.get(n);
  return pipe(
    Mutex.lock,
    E.andThen(() => {
      return FC.render(n.type, n.props);
    }),
    E.map((rs) => {
      Polymer.commit(poly);
      return El.trie(n, rs);
    }),
    E.tap(Globals.done),
    E.tapDefect(() => Globals.done),
    E.tap(updateNode(rh, n, poly)),
  );
};

export class UpdateDefect extends Data.TaggedError('UpdateDefect')<{
  root : Rehydrant.Rehydrant;
  node : El.Comp;
  cause: Cause.Cause<Error>;
}> {}

const updateNode = (r: Rehydrant.Rehydrant, n: El.Comp, poly: Polymer.Polymer) =>
  pipe(
    E.forEach(poly.queue, (effect) => {
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
    E.catchAllCause((cause) =>
      new UpdateDefect({
        root : r,
        node : n,
        cause: cause,
      }),
    ),
  );

const OptionalPart = E.serviceOption(Relay).pipe(
  E.map(Option.map((relay) =>
    (p: Progress.Part[]) => relay.sendN(p),
  )),
  E.map(Option.getOrElse(() =>
    (p: Progress.Part[]) => E.void,
  )),
);

export const init2 = (rh: Rehydrant.Rehydrant) => OptionalPart.pipe(E.flatMap((sendParts) => {
  const s = Stack.make(rh.element);

  const body = () => {
    const n = Stack.pull(s)!;
    El.trie(n);

    if (El.isRest(n)) {
      if (!n.rs) {
        return E.void;
      }
      const parts = [] as Progress.Part[];
      for (let i = 0; i < n.rs.length; i++) {
        const c = n.rs[i];
        if (!El.isText(c)) {
          parts.push(Progress.part(rh.id, n.type, n.props));
          Stack.push(s, c);
        }
      }
      return sendParts(parts).pipe(E.asVoid);
    }

    return pipe(
      renderNode(rh, n),
      E.map((rendered) => {
        n.rs = rendered;
        Stack.pushAll(s, n);
      }),
    );
  };

  return pipe(
    E.whileLoop({
      while: () => Stack.cont(s),
      step : () => {},
      body,
    }),
    E.as(rh),
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

      const stack = MutableList.make<El.El>(root.element);
      const args = new WeakMap();
      const outs = new WeakMap();
      const last = {} as any;
      outs.set(root.element, last);

      while (MutableList.tail(stack)) {
        const n = MutableList.pop(stack)!;
        const out = outs.get(n);

        if (El.isComp(n)) {
          if (!n.rs) {
            continue;
          }
          for (let i = n.rs.length - 1; i >= 0; --i) {
            const c = n.rs[i];
            outs.set(c, out);
            MutableList.append(stack, c);
          }
        }
        else if (El.isText(n)) {
          if (!n.text) {
            continue;
          }
          out[primitive] ??= [];
          out[primitive].push(n.text);
        }
        else if (args.has(n)) {
          const norm = normalization[n.type];
          out[norm] ??= [];
          out[norm].push((encoding[n.type](n, args.get(n)!)));
        }
        else if (!n.rs || n.rs.length === 0) {
          const norm = normalization[n.type];
          out[norm] ??= [];
          out[norm].push((encoding[n.type](n, {})));
        }
        else {
          const arg = {};
          args.set(n, arg);
          MutableList.append(stack, n);

          for (const c of n.rs.toReversed()) {
            outs.set(c, arg);
            MutableList.append(stack, c);
          }
        }
      }
      for (const key of Object.keys(last)) {
        if (last[key]) {
          return {
            _tag    : key,
            hydrator: Rehydrant.dehydrate(root),
            data    : last[key][0],
          };
        }
      }
      return null;
    }),
    E.timeout(Duration.seconds(1)),
    E.catchAllCause((cause) =>
      E.zipRight(
        E.logFatal(cause),
        new EncodeDefect({
          root : root,
          cause: cause,
        }),
      ),
    ),
  );

export const rehy2 = (rh: Rehydrant.Rehydrant) => E.suspend(() => {
  const ps = Rehydrant.hydration(rh);
  const s = Stack.make(rh.element);

  const body = () => {
    const n = Stack.pull(s);
    El.trie(n);

    if (El.isComp(n)) {
      if (ps?.[n._n!]) {
        const polymer = Polymer.rehydrated(ps[n._n!]);
        Polymer.set(n, polymer);
      }
      return pipe(
        renderNode(rh, n),
        E.map((rs) => {
          n.rs = rs;
          Stack.pushAll(s, n);
        }),
      );
    }
    Stack.pushAll(s, n);
    return E.void;
  };

  return pipe(
    E.whileLoop({
      while: () => Stack.cont(s),
      step : () => {},
      body : body,
    }),
    E.as(rh),
  );
});

export class EventDefect extends Data.TaggedError('EventDefect')<{
  root : Rehydrant.Rehydrant;
  node?: El.Rest;
  event: El.Event;
  cause: Cause.Cause<Error>;
}> {}

const renderEvent = (rh: Rehydrant.Rehydrant, n: El.Rest, event: El.Event) =>
  pipe(
    E.suspend(() => {
      const handler = n.handler;
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
      if (rh.next.id === null) {
        return Relay.final(Progress.exit());
      }
      if (rh.next.id === rh.id) {
        return Relay.final(Progress.same(rh));
      }
      return Relay.final(Progress.next(rh));
    }),
    E.catchAllCause((cause) =>
      new EventDefect({
        root : rh,
        node : n,
        event: event,
        cause: cause,
      }),
    ),
  );

export const invoke = (rh: Rehydrant.Rehydrant, event: El.Event) =>
  pipe(
    E.sync(() => {
      const stack = Stack.make(rh.element);

      let target: El.Rest | undefined;

      while (Stack.cont(stack)) {
        const node = Stack.pull(stack)!;

        if (El.isRest(node)) {
          if (node.props.custom_id === event.id || node._s === event.id) {
            target = node;
            break;
          }
        }

        Stack.pushAll(stack, node);
      }
      if (!target) {
        throw new Error('Event target does not exist');
      }

      return target;
    }),
    E.flatMap((target) => renderEvent(rh, target, event)),
    E.as(rh),
    E.catchAllCause((cause) =>
      new EventDefect({
        root : rh,
        event: event,
        cause: cause,
      }),
    ),
  );

const mount = <A extends El.El>(rh: Rehydrant.Rehydrant, n0: A) => E.suspend(() => {
  if (El.isText(n0)) {
    return E.succeed(n0);
  }

  const stack = Stack.make(n0);

  const body = () => {
    const next = Stack.pull(stack)!;
    El.trie(next);

    if (El.isRest(next)) {
      Stack.pushAll(stack, next);
      return E.void;
    }

    return pipe(
      renderNode(rh, next),
      E.map((rendered) => {
        next.rs = rendered;
        Stack.pushAll(stack, next);
      }),
    );
  };

  return pipe(
    E.whileLoop({
      while: () => Stack.cont(stack),
      step : () => {},
      body,
    }),
    E.as(n0),
  );
});

export const rerenders = (rh: Rehydrant.Rehydrant) => E.gen(function* () {
  const s = Stack.make(rh.element);
  const rs = yield* renderNode(rh, rh.element);
  Diff.rendered(rh.element, rs);

  while (Stack.cont(s)) {
    const n = Stack.pull(s);

    if (!n.rs) {
      continue;
    }
    El.trie(n);

    const diffs = Diff.nodes(n);

    if (!diffs) {
      continue;
    }

    for (let i = 0; i < diffs.length; i++) {
      const d = diffs[i];
      const c = n.rs[i];
      if (Diff.isSkip(d)) {
        continue;
      }
      else if (Diff.isUpdate(d)) {
        const u = d.node;
        if (El.isText(u)) {
          n.rs[i] = u;
          continue;
        }
        else if (El.isRest(u)) {
          n.rs[i].props = Props.make(u.props);
        }
        else {
          n.rs[i].props = Props.make(u.props);
        }
        Diff.rendered(c, u.rs);
        Stack.push(s, c);
      }
      else if (Diff.isRender(d)) {
        const rs = yield* renderNode(rh, c as El.Comp);
        Diff.rendered(c, rs);
        Stack.push(s, c);
      }
      else if (Diff.isReplace(d)) {
        n.rs[i] = yield* mount(rh, d.node);
      }
      else if (Diff.isInsert(d)) {
        const ins = yield* mount(rh, d.node);
        El.insert(n, ins, i);
      }
      else if (Diff.isRemove(d)) {
        El.remove(n, i);
      }
    }
  }

  return rh;
});
