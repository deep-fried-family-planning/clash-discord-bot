import {props} from '#src/disreact/adaptor/adaptor/element.ts';
import type * as Document from '#src/disreact/core/primitives/document.ts';
import type * as Node from '#src/disreact/core/primitives/nodev1.ts';
import * as Polymer from '#src/disreact/core/primitives/polymer.ts';
import {ASYNC, DEV_STUB, EFFECT, INTERNAL_ERROR, IS_DEV, SYNC} from '#src/disreact/core/primitives/constants.ts';
import * as proto from '#src/disreact/core/behaviors/proto.ts';
import * as FC from '#src/disreact/core/primitives/fc.ts';
import * as Hooks from '#src/disreact/runtime/hooks.ts';
import type * as Jsx from '#src/disreact/runtime/jsx.tsx';
import * as Array from 'effect/Array';
import * as Data from 'effect/Data';
import * as E from 'effect/Effect';
import {EffectTypeId} from 'effect/Effectable';
import {pipe} from 'effect/Function';
import * as P from 'effect/Predicate';

export type dispatch = DEV_STUB;
export const dispatch = DEV_STUB;

const mutex  = E.unsafeMakeSemaphore(1),
      lock   = mutex.take(1),
      unlock = mutex.release(1);

const callComponent = (node: Node.Functional) => {
  const fc = node.component,
        p  = node.props;

  switch (fc._tag) {
    case SYNC: {
      return E.succeed(fc(p) as Jsx.Children);
    }
    case ASYNC: {
      return E.promise(() => fc(p) as Promise<Jsx.Children>);
    }
    case EFFECT: {
      return fc(props) as E.Effect<Jsx.Children>;
    }
  }
  const output = fc(p);

  if (P.isPromise(output)) {
    return E.die('Async keyword required for async promises');
  }
  if (E.isEffect(output)) {
    FC.cast(fc, EFFECT);
    return output as E.Effect<Jsx.Children>;
  }
  FC.cast(fc, SYNC);
  return E.succeed(output);
};

export const render = (node: Node.Functional) =>
  lock.pipe(
    E.flatMap(() => {
      Hooks.active.polymer = node.polymer!;
      return callComponent(node);
    }),
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

export class UpdateError extends Data.TaggedError('UpdateError')<{
  message?: string;
  document: Document.Document<Node.Nodev1>;
  node    : Node.Nodev1;
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
  if (proto.isAsync(fx)) {
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
  document: Document.Document<Node.Nodev1>;
  node    : Node.Nodev1;
}>
{}

export const invoke = (n: Node.Intrinsic, d: Document.Document<Node.Nodev1>, event: any) => E.suspend(() => {
  return E.void;
});

const runEvent = (fn: any, event: any) => E.suspend(() => {
  if (proto.isAsync(fn)) {
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

// @ts-expect-error library stuff
if (proto.LocalEffectTypeId !== EffectTypeId) {
  throw new Error(INTERNAL_ERROR);
}
