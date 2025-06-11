import * as Diff from '#src/disreact/model/diff.ts';
import * as Element from '#src/disreact/model/entity/element.ts';
import {poly} from '#src/disreact/model/entity/globals.ts';
import * as Polymer from '#src/disreact/model/entity/polymer.ts';
import * as Rehydrant from '#src/disreact/model/entity/rehydrant.ts';
import {Rehydrator} from '#src/disreact/model/Rehydrator.ts';
import {Relay} from '#src/disreact/model/Relay.ts';
import * as Const from '#src/disreact/model/util/const.ts';
import * as Mutex from '#src/disreact/model/util/mutex.ts';
import * as Progress from '#src/disreact/model/util/progress.ts';
import * as Stack from '#src/disreact/model/util/stack.ts';
import {Predicate} from 'effect';
import * as Cause from 'effect/Cause';
import * as Data from 'effect/Data';
import * as Duration from 'effect/Duration';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';
import * as MutableList from 'effect/MutableList';
import * as Option from 'effect/Option';
import * as P from 'effect/Predicate';

export interface Base<T extends number> {
  _tag: T;
}

export class EncodeDefect extends Data.TaggedError('EncodeDefect')<{
  root : Rehydrant.Rehydrant | null;
  cause: Cause.Cause<Error>;
}> {}

export const encode = (rh: Rehydrant.Rehydrant | null) =>
  pipe(
    Rehydrator.use((rehydrator) => {
      if (!rh) {
        return null;
      }
      const primitive = rehydrator.primitive;
      const normalization = rehydrator.normalization;
      const encoding = rehydrator.encoding;

      const stack = MutableList.make<Element.Element>(rh.root);
      const args = new WeakMap();
      const outs = new WeakMap();
      const last = {} as any;
      outs.set(rh.root, last);

      while (MutableList.tail(stack)) {
        const n = MutableList.pop(stack)!;
        const out = outs.get(n);

        if (Element.isComponent(n)) {
          if (!n.rs) {
            continue;
          }
          for (const c of n.rs.toReversed()) {
            outs.set(c, out);
            MutableList.append(stack, c);
          }
        }
        else if (Element.isText(n)) {
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
            hydrator: Rehydrant.dehydrate(rh),
            data    : last[key][0],
          };
        }
      }
      return null;
    }),
    E.timeout(Duration.seconds(1)),
    E.catchAllCause((cause) =>
      new LifecycleDefect({
        message: Cause.pretty(cause),
        cause  : cause,
      }),
    ),
  );

export class LifecycleDefect extends Data.TaggedError('LifecycleDefect')<{
  message?: string;
  cause?  : Cause.Cause<Error>;
}> {}

export class RenderDefect extends Data.TaggedError('RenderDefect')<{
  root : Rehydrant.Rehydrant;
  node : Element.Component;
  cause: Cause.Cause<Error>;
}> {}

const renderNode = (rh: Rehydrant.Rehydrant, n: Element.Component) =>
  pipe(
    Mutex.acquire(rh, n),
    E.andThen(render(n)),
    E.tap(Mutex.release()),
    E.tapDefect(Mutex.release),
    E.map((rs) => {
      Polymer.done(n);
      return Element.trie(n, rs);
    }),
    E.tap(updateNode(rh, n)),
  );

export class UpdateDefect extends Data.TaggedError('UpdateDefect')<{
  root : Rehydrant.Rehydrant;
  node : Element.Component;
  cause: Cause.Cause<Error>;
}> {}

const updateNode = (r: Rehydrant.Rehydrant, n: Element.Component) =>
  pipe(
    Polymer.get(n).queue,
    E.forEach((fx) => {
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
  const s = Stack.make(rh.root);

  const body = () => {
    const n = Stack.pull(s)!;
    Element.trie(n);

    if (Element.isRest(n)) {
      if (!n.rs) {
        return E.void;
      }
      const parts = [] as Progress.Part[];
      for (let i = 0; i < n.rs.length; i++) {
        const c = n.rs[i];
        if (!Element.isText(c)) {
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

export const rehy2 = (rh: Rehydrant.Rehydrant) => E.suspend(() => {
  const s = Stack.make(rh.root);

  const body = () => {
    const n = Stack.pull(s);
    Element.trie(n);

    if (Element.isComponent(n)) {
      const didRehydrate = Rehydrant.restore(rh, n);

      if (!didRehydrate) {
        const maybe = Polymer.get(n);
        maybe.rc = 1;
      }

      return pipe(
        renderNode(rh, n),
        E.tap(() => {
          const polymer = Polymer.get(n);
          if (polymer.queue.length) {
            throw new Error();
          }
          if (!didRehydrate && polymer.curr.length) {
            throw new Error();
          }
        }),
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
  node?: Element.Rest;
  event: Element.Event;
  cause: Cause.Cause<Error>;
}> {}

const renderEvent = (rh: Rehydrant.Rehydrant, n: Element.Rest, event: Element.Event) =>
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

export const invoke2 = (rh: Rehydrant.Rehydrant, event: Element.Event) =>
  pipe(
    E.sync(() => {
      const stack = Stack.make(rh.root);

      let target: Element.Rest | undefined;

      while (Stack.cont(stack)) {
        const node = Stack.pull(stack)!;

        if (Element.isRest(node)) {
          if (node.props!.custom_id === event.id || node._s === event.id) {
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

const mount = <A extends Element.Element>(rh: Rehydrant.Rehydrant, n0: A) => E.suspend(() => {
  if (Element.isText(n0)) {
    return E.succeed(n0);
  }

  const stack = Stack.make(n0);

  const body = () => {
    const next = Stack.pull(stack)!;
    Element.trie(next);

    if (Element.isRest(next)) {
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
  const s = Stack.make(rh.root);
  const rs = yield* renderNode(rh, rh.root as Element.Component);
  Diff.rendered(rh.root, rs);

  while (Stack.cont(s)) {
    const n = Stack.pull(s);

    if (!n.rs) {
      continue;
    }
    Element.trie(n);

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
        if (Element.isText(u)) {
          n.rs[i] = u;
          continue;
        }
        else if (Element.isRest(u)) {
          n.rs[i].props = Element.props(u.props);
        }
        else {
          n.rs[i].props = Element.props(u.props);
        }
        Diff.rendered(c, u.rs);
        Stack.push(s, c);
      }
      else if (Diff.isRender(d)) {
        const rs = yield* renderNode(rh, c as Element.Component);
        Diff.rendered(c, rs);
        Stack.push(s, c);
      }
      else if (Diff.isReplace(d)) {
        n.rs[i] = yield* mount(rh, d.node);
      }
      else if (Diff.isInsert(d)) {
        const ins = yield* mount(rh, d.node);
        Element.insert(n, ins, i);
      }
      else if (Diff.isRemove(d)) {
        Element.remove(n, i);
      }
    }
  }

  return rh;
});

const flushEffects = (node: Element.Component) => E.suspend(() => {
  const polymer = Polymer.get(node);

  if (!polymer.queue.length) {
    return E.void;
  }

  return pipe(
    E.forEach(polymer.queue, (fx) => {
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
    E.catchAllCause((cause) =>
      new LifecycleDefect({
        message: Cause.pretty(cause),
        cause  : cause,
      }),
    ),
  );
});

const render = (node: Element.Component) => {
  const props = node.props;
  const fc = node.type;

  switch (fc[Element.RunId]) {
    case Const.SYNC: {
      return E.sync(() => fc(props) as any);
    }
    case Const.PROMISE: {
      return E.promise(() => fc(props) as Promise<any>);
    }
    case Const.EFFECT: {
      return fc(props) as E.Effect<any>;
    }
  }

  return E.suspend(() => {
    const out = fc(props);
    if (Predicate.isPromise(out)) {
      fc[Element.RunId] = Const.PROMISE;

      return E.promise(() => out);
    }
    if (E.isEffect(out)) {
      fc[Element.RunId] = Const.EFFECT;

      return out as E.Effect<any>;
    }
    fc[Element.RunId] = Const.SYNC;

    return E.succeed(out);
  });
};
