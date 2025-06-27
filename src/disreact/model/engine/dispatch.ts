import type * as Document from '#src/disreact/core/document.ts';
import type * as Node from '#src/disreact/core/node.ts';
import * as Polymer from '#src/disreact/core/polymer.ts';
import {ASYNC, EFFECT, INTERNAL_ERROR, IS_DEV, SYNC} from '#src/disreact/core/primitives/constants.ts';
import * as type from '#src/disreact/core/primitives/type.ts';
import * as FC from '#src/disreact/model/runtime/fc.ts';
import * as Hooks from '#src/disreact/model/runtime/hooks.ts';
import type * as Jsx from '#src/disreact/model/runtime/jsx.tsx';
import * as Data from 'effect/Data';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';
import * as P from 'effect/Predicate';
import * as Array from 'effect/Array';

export type dispatch = never;

const
  mutex  = E.unsafeMakeSemaphore(1),
  lock   = mutex.take(1),
  unlock = mutex.release(1);

export const render = (node: Node.Functional) =>
  lock.pipe(
    E.map(() => {
      Hooks.active.polymer = node.polymer!;
    }),
    E.andThen(runFC(node.component, node.props)),
    E.tap(() => {
      Hooks.active.polymer = undefined;
      return unlock;
    }),
    E.map((rs) => {
      Polymer.commit(node.polymer!);

      if (!rs) {
        return node;
      }
      node.childs = Array.ensure(rs);
      return node;
    }),
    E.tapDefect(() => unlock),
  );

const runFC = (fc: FC.FC, props: any) => {
  switch (FC.kind(fc)) {
    case SYNC: {
      return E.sync(() => fc(props) as Jsx.Children);
    }
    case ASYNC: {
      return E.promise(() => fc(props) as Promise<Jsx.Children>);
    }
    case EFFECT: {
      return fc(props) as E.Effect<Jsx.Children>;
    }
  }
  return E.suspend(() => {
    const output = fc(props);

    if (P.isPromise(output)) {
      FC.cast(fc, FC.AsyncPrototype);
      return E.promise(() => output);
    }
    if (E.isEffect(output)) {
      FC.cast(fc, FC.EffectPrototype);
      return output as E.Effect<Jsx.Children>;
    }
    FC.cast(fc, FC.SyncPrototype);
    return E.succeed(output);
  });
};

export class UpdateError extends Data.TaggedError('UpdateError')<{
  message?: string;
  document: Document.Document<Node.Node>;
  node    : Node.Node;
}>
{}

export const update = (n: Node.Functional) => E.suspend(() => {
  if (IS_DEV && !n.polymer) {
    throw new Error(INTERNAL_ERROR);
  }
  if (!Polymer.hasEffects(n.polymer!)) {
    return E.succeed(n);
  }
  return pipe(
    Polymer.flush(n.polymer!),
    E.forEach(runFx),
    E.as(n),
    // E.catchAllCause((cause) =>
    //   new UpdateError({
    //     message : Cause.pretty(cause),
    //     document: d,
    //     node    : n,
    //   }),
    // ),
  );
});

const runFx = (fx: Polymer.EffectFn) => E.suspend(() => {
  if (type.isAsync(fx)) {
    return E.promise(fx);
  }
  const out = fx();

  if (P.isPromise(out)) {
    return E.promise(() => out);
  }
  if (E.isEffect(out)) {
    return out;
  }
  return E.void;
});

export class InvokeError extends Data.TaggedError('InvokeError')<{
  message?: string;
  event   : any;
  document: Document.Document<Node.Node>;
  node    : Node.Node;
}>
{}

export const invoke = (n: Node.Intrinsic, d: Document.Document<Node.Node>, event: any) => E.suspend(() => {
  return E.void;
});

const runEvent = (fn: any, event: any) => E.suspend(() => {
  if (type.isAsync(fn)) {
    return E.promise(() => fn(event));
  }
  const out = fn(event);
  if (P.isPromise(out)) {
    return E.promise(() => out);
  }
  if (E.isEffect(out)) {
    return out;
  }
  return E.void;
});

export const runAllFx = (p: Polymer.Polymer) => E.suspend(() => {
  if (!Polymer.hasEffects(p)) {
    return E.void;
  }
  return pipe(
    Polymer.flush(p),
    E.forEach(runFx),
    E.asVoid,
  );
});
