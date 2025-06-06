import * as El from '#src/disreact/model/entity/element.ts';
import * as FC from '#src/disreact/model/entity/fc.ts';
import * as Polymer from '#src/disreact/model/entity/polymer.ts';
import * as Props from '#src/disreact/model/entity/props.ts';
import * as Proto from '#src/disreact/model/entity/proto.ts';
import * as Rehydrant from '#src/disreact/model/entity/rehydrant.ts';
import * as Diff from '#src/disreact/model/lifecycle/diff.ts';
import {Rehydrator} from '#src/disreact/model/Rehydrator.ts';
import {Relay} from '#src/disreact/model/Relay.ts';
import * as Globals from '#src/disreact/model/util/globals.ts';
import * as Progress from '#src/disreact/model/util/progress.ts';
import * as Stack from '#src/disreact/model/util/stack.ts';
import {Duration, GlobalValue} from 'effect';
import type * as Cause from 'effect/Cause';
import * as Data from 'effect/Data';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';
import * as MutableList from 'effect/MutableList';
import * as Option from 'effect/Option';
import * as P from 'effect/Predicate';

export class RenderDefect extends Data.TaggedError('RenderDefect')<{
  root : Rehydrant.Rehydrant;
  node : El.Comp;
  cause: Cause.Cause<Error>;
}> {}

const renderNode = (rh: Rehydrant.Rehydrant, n: El.Comp) => {
  const poly = Polymer.get(n);
  return pipe(
    Globals.lock(rh, n, poly),
    E.andThen(FC.render(n.type, n.props)),
    E.map((rs) => {
      Polymer.commit(poly);
      return El.trie(n, rs);
    }),
    E.tap(Globals.done),
    Proto.isDEV
    ? E.tapDefect(() => Globals.done)
    : E.catchAllCause(
      (cause) => E.zipRight(
        Globals.done,
        new RenderDefect({root: rh, node: n, cause: cause}),
      ),
    ),
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

const enum OP {
  INIT = 1,
  REHYDRATE,
  MOUNT,
  RERENDER,
  DISMOUNT,
  NOTIFY,
}
namespace Op {

}

namespace Patch {
  export type Done = {
    _tag: 'Done';
  };

  export const {done, cont, append, prepend, replace, update, insert, remove, render, splice, $match: match} = Data.taggedEnum<Patch>();
  export type Patch = Data.TaggedEnum<{
    done   : {};
    cont   : {};
    append : {with: El.El[]};
    prepend: {with: El.El[]};
    replace: {at: number; with: El.El};
    update : {at: number; with: El.El};
    insert : {at: number; with: El.El[]};
    remove : {at: number; len: number};
    render : {component: El.Comp};
    splice : {with: El.El[]; at: number; len: number};
  }>;
}

const node = Data.taggedEnum<Data.TaggedEnum<{
  done   : {};
  cont   : {parent: El.El; nodes: El.El[]};
  replace: {parent: El.El; node: El.El};
  update : {parent: El.El; node: El.El};
}>>();

const children = Data.taggedEnum<Data.TaggedEnum<{
  append : {with: El.El[]};
  prepend: {with: El.El[]};
  insert : {at: number; with: El.El[]};
  remove : {at: number; len: number};
}>>();

const thing = Patch.match({
  done   : (p) => {},
  cont   : (p) => {},
  append : (p) => {},
  prepend: (p) => {},
  replace: (p) => {},
  update : (p) => {},
  insert : (p) => {},
  remove : (p) => {},
  render : (p) => {},
  splice : (p) => {},
});

const OptionalPart = E.serviceOption(Relay).pipe(
  E.map(Option.map((relay) =>
    (p: Progress.Part[]) => relay.sendN(p),
  )),
  E.map(Option.getOrElse(() =>
    (p: Progress.Part[]) => E.void,
  )),
);

export const initialize = (rh: Rehydrant.Rehydrant) => OptionalPart.pipe(E.flatMap((sendParts) => {
  const s = Stack.make(rh.root);

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

      const stack = MutableList.make<El.El>(root.root);
      const args = new WeakMap();
      const outs = new WeakMap();
      const last = {} as any;
      outs.set(root.root, last);

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

export const rehydrate = (rh: Rehydrant.Rehydrant) => E.suspend(() => {
  const ps = Rehydrant.hydration(rh);
  const s = Stack.make(rh.root);

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
      const stack = Stack.make(rh.root);

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

export const rerender = (rh: Rehydrant.Rehydrant) => E.gen(function* () {
  const s = Stack.make(rh.root);
  const rs = yield* renderNode(rh, rh.root);
  Diff.rendered(rh.root, rs);

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

const mutex = E.unsafeMakeSemaphore(1);
export const lock = mutex.withPermits;

const render = (n: El.Comp) =>
  pipe(
    {},
  );

const synth = (n: El.Comp) =>
  pipe(
    {},
  );

export class RehydrationDefect extends Data.TaggedError('RehydrationDefect')<{
  cause?: Cause.Cause<Error>;
}> {}

const rehydration = (rh: Rehydrant.Rehydrant, n: El.Comp) => E.suspend(() => {
  const hydrator = Rehydrant.hydration(rh);
  if (!hydrator) {
    return new RehydrationDefect({});
  }
  const polymer = hydrator[n._n!];
  if (!polymer) {
    return E.void;
  }
  return E.void;
});
