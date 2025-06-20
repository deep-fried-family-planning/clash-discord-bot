import * as JsxDefault from '#src/disreact/codec/intrinsic/index.ts';
import * as Diff from '#src/disreact/codec/old/diffs.ts';
import * as Component from '#src/disreact/model/entity/component.ts';
import * as Element from '#src/disreact/model/entity/core/exp/element.ts';
import * as Polymer from '#src/disreact/model/entity/polymer.ts';
import * as Rehydrant from '#src/disreact/model/entity/envelope.ts';
import {Relay} from '#src/disreact/model/Relay.ts';
import * as Mutex from '#src/disreact/model/infrastructure/mutex.ts';
import * as Progress from '#src/disreact/codec/old/progress2.ts';
import * as Stack from '#src/disreact/model/entity/stack.ts';
import * as Cause from 'effect/Cause';
import * as Data from 'effect/Data';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';
import * as MutableList from 'effect/MutableList';
import * as Option from 'effect/Option';
import * as Predicate from 'effect/Predicate';
import * as Stream from 'effect/Stream';

export const mountNode = () => {

};

export const mountAll = () =>
  pipe(

  );

export const unmountNode = () => E.sync(() => {

});

const renderNode = (rh: Rehydrant.Envelope, n: Element.Func) =>
  pipe(
    Component.render(n, rh),
    E.tap(Component.runEffects(n)),
  );

const OptionalPart = E.serviceOption(Relay).pipe(
  E.map(Option.map((relay) =>
    (p: Progress.Part[]) => relay.sendN(p),
  )),
  E.map(Option.getOrElse(() =>
    (p: Progress.Part[]) => E.void,
  )),
);

export const init__ = (rh: Rehydrant.Envelope) => OptionalPart.pipe(E.flatMap((sendParts) => {
  const s = Stack.start(rh.root);

  const body = () => {
    const n = Stack.pop(s)!;

    if (Element.isText(n)) {
      return E.void;
    }

    Element.trie(n);

    if (Element.isRest(n)) {
      if (!n.under) {
        return E.void;
      }
      const parts = [] as Progress.Part[];
      for (let i = 0; i < n.under.length; i++) {
        const c = n.under[i];
        if (!Element.isText(c)) {
          parts.push(Progress.part(rh.id, n.type, n.props));
          Stack.push(s, c);
        }
      }
      return sendParts(parts).pipe(E.asVoid);
    }

    return pipe(
      renderNode(rh, Component.mount(n, rh)),
      E.map((rendered) => {
        n.under = rendered;
        Stack.pushNodes(s, n);
      }),
    );
  };

  return pipe(
    E.whileLoop({
      while: () => Stack.condition(s),
      step : () => {},
      body,
    }),
    E.as(rh),
  );
}));

Stream;

export const rehydrate__ = (rh: Rehydrant.Envelope) => E.suspend(() => {
  const s = Stack.start(rh.root);

  const body = () => {
    const n = Stack.pop(s);

    Element.trie(n);

    if (Element.isFunc(n)) {
      if (Component.didMount(n)) {
        return E.void;
      }

      return pipe(
        renderNode(rh, Component.hydrate(n, rh)),
        E.tap(() => {
          const polymer = Polymer.get(n);
          if (polymer.queue.length) {
            throw new Error();
          }
        }),
        E.map((rs) => {
          n.under = rs;
          Stack.pushNodes(s, n);
        }),
      );
    }
    Stack.pushNodes(s, n);
    return E.void;
  };

  return pipe(
    E.whileLoop({
      while: () => Stack.condition(s),
      step : () => {},
      body : body,
    }),
    E.as(rh),
  );
});

export class EventDefect extends Data.TaggedError('EventDefect')<{
  root : Rehydrant.Envelope;
  node?: Element.Rest;
  event: Element.Event;
  cause: Cause.Cause<Error>;
}> {}

const renderEvent = (rh: Rehydrant.Envelope, n: Element.Rest, event: Element.Event) =>
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
      if (Predicate.isPromise(output)) {
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

export const invoke2 = (rh: Rehydrant.Envelope, event: Element.Event) =>
  pipe(
    E.sync(() => {
      const stack = Stack.start(rh.root);

      let target: Element.Rest | undefined;

      while (Stack.condition(stack)) {
        const node = Stack.pop(stack)!;

        if (Element.isRest(node)) {
          if (node.props!.custom_id === event.id || node._s === event.id) {
            target = node;
            break;
          }
        }

        Stack.pushNodes__(stack, node);
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

const mount__ = <A extends Element.Element>(rh: Rehydrant.Envelope, n0: A) => E.suspend(() => {
  if (Element.isText(n0)) {
    return E.succeed(n0);
  }

  const stack = Stack.start(n0);

  const body = () => {
    const next = Stack.pop(stack)!;

    if (Element.isText(next)) {
      return E.void;
    }

    Element.trie(next);

    if (Element.isRest(next)) {
      Stack.pushNodes(stack, next);
      return E.void;
    }

    return pipe(
      renderNode(rh, Component.mount(next, rh)),
      E.map((rendered) => {
        next.under = rendered;
        Stack.pushNodes(stack, next);
      }),
    );
  };

  return pipe(
    E.whileLoop({
      while: () => Stack.condition(stack),
      step : () => {},
      body,
    }),
    E.as(n0),
  );
});

const dismount = <A extends Element.Element>(n0: A) => {
  const stack = Stack.start(n0);

  const body = () => {
    const n = Stack.pop(stack)!;
    Element.trie(n);

    if (!Stack.isVisited(stack, n)) {
      Stack.visit(stack, n);
      Stack.push(stack, n);
      Stack.pushNodes(stack, n);
      return E.void;
    }

    if (Element.isText(n)) {
      return E.void;
    }

    if (Element.isRest(n)) {
      delete n.under;
      return E.void;
    }

    return Component.unmount(n);
  };

  return pipe(
    E.whileLoop({
      while: () => Stack.condition(stack),
      step : () => {},
      body,
    }),
    E.as(n0),
  );
};

export const rerenders = (rh: Rehydrant.Envelope) => E.gen(function* () {
  const s = Stack.start(rh.root);
  const rs = yield* renderNode(rh, rh.root as Element.Func);
  Diff.rendered(rh.root, rs);

  while (Stack.condition(s)) {
    const n = Stack.pop(s);

    if (!n.under) {
      continue;
    }
    Element.trie(n);

    const diffs = Diff.nodes(n);

    if (!diffs) {
      continue;
    }

    for (let i = 0; i < diffs.length; i++) {
      const d = diffs[i];
      const c = n.under[i];
      if (Diff.isSkip(d)) {
        continue;
      }
      else if (Diff.isUpdate(d)) {
        const u = d.node;
        if (Element.isText(u)) {
          n.under[i] = u;
          continue;
        }
        else if (Element.isRest(u)) {
          n.under[i].props = Element.props(u.props);
        }
        else {
          n.under[i].props = Element.props(u.props);
        }
        Diff.rendered(c, u.under);
        Stack.push(s, c);
      }
      else if (Diff.isRender(d)) {
        const rs = yield* renderNode(rh, c as Element.Func);
        Diff.rendered(c, rs);
        Stack.push(s, c);
      }
      else if (Diff.isReplace(d)) {
        n.under[i] = yield* mount__(rh, d.node);
      }
      else if (Diff.isInsert(d)) {
        const ins = yield* mount__(rh, d.node);
        Element.insert(n, ins, i);
      }
      else if (Diff.isRemove(d)) {
        Element.remove(n, i);
      }
    }
  }

  return rh;
});

export class EncodeDefect extends Data.TaggedError('EncodeDefect')<{
  message: string;
  root   : Rehydrant.Envelope | null;
  cause  : Cause.Cause<Error>;
}> {}

const primitive     = JsxDefault.primitive,
      normalization = JsxDefault.normalization as Record<string, string>,
      encoding      = JsxDefault.encoding as Record<string, (self: any, acc: any) => any>;

export const encode = (rh: Rehydrant.Envelope | null) =>
  pipe(
    E.sync(() => {
      if (!rh) {
        return null;
      }
      const stack = MutableList.make<Element.Element>(rh.root);
      const args = new WeakMap();
      const outs = new WeakMap();
      const last = {} as any;
      outs.set(rh.root, last);

      while (MutableList.tail(stack)) {
        const n = MutableList.pop(stack)!;
        const out = outs.get(n);

        if (Element.isFunc(n)) {
          if (!Component.didMount(n)) {
            throw new Error();
          }
          const rs = Component.dehydrate(n, rh);
          if (!rs) {
            continue;
          }
          for (const c of rs.toReversed()) {
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
        else if (!n.under || n.under.length === 0) {
          const norm = normalization[n.type];
          out[norm] ??= [];
          out[norm].push((encoding[n.type](n, {})));
        }
        else {
          const arg = {};
          args.set(n, arg);
          MutableList.append(stack, n);

          for (const c of n.under.toReversed()) {
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
    // E.timeout(Duration.seconds(1)),
    E.catchAllCause((cause) =>
      new LifecycleDefect({
        message: Cause.pretty(cause),
        cause  : cause,
      }),
    ),
  );


export class UpdateDefect extends Data.TaggedError('UpdateDefect')<{
  root : Rehydrant.Envelope;
  node : Element.Func;
  cause: Cause.Cause<Error>;
}> {}
export class LifecycleDefect extends Data.TaggedError('LifecycleDefect')<{
  message?: string;
  cause?  : Cause.Cause<Error>;
}> {}

export class RenderDefect extends Data.TaggedError('RenderDefect')<{
  root : Rehydrant.Envelope;
  node : Element.Func;
  cause: Cause.Cause<Error>;
}> {}
