import {ASYNC, EFFECT, INTERNAL_ERROR, IS_DEV, SYNC} from '#src/disreact/model/internal/core/constants.ts';
import * as FC from '#src/disreact/model/internal/infrastructure/fc.ts';
import type * as Document from '#src/disreact/model/internal/document.ts';
import * as current from '#src/disreact/model/internal/infrastructure/current.ts';
import type * as Jsx from '#src/disreact/model/internal/infrastructure/jsx.ts';
import * as type from '#src/disreact/model/internal/infrastructure/type.ts';
import type * as Node from '#src/disreact/model/internal/node.ts';
import * as Polymer from '#src/disreact/model/internal/polymer.ts';
import * as Cause from 'effect/Cause';
import * as Data from 'effect/Data';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';
import {globalValue} from 'effect/GlobalValue';
import * as P from 'effect/Predicate';

export type dispatch = never;

const mutex = globalValue(
  Symbol.for('disreact/mutex'),
  () => E.unsafeMakeSemaphore(1),
);

current.setRelease(() =>
  E.runSync(mutex.release(1)),
);

export class RenderError extends Data.TaggedError('RenderError')<{
  message?: string;
  document: Document.Document<Node.Node>;
  node    : Node.Node;
}>
{}

export const render = (n: Node.Functional, d: Document.Document<Node.Node>) =>
  pipe(
    mutex.take(1),
    E.andThen(() => {
      current.set(n, d);
      return runFC(n.component, n.props);
    }),
    E.tap(() => {
      current.reset();
      Polymer.commit(n.polymer!);
      return mutex.release(1);
    }),
    // E.tapDefect((cause) => {
    //   current.reset();
    //
    //   return E.zipRight(
    //     mutex.release(1),
    //     new RenderError({
    //       message : Cause.pretty(cause),
    //       document: d,
    //       node    : n,
    //     }),
    //   );
    // }),
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

export const update = (n: Node.Functional, d: Document.Document<Node.Node>) => E.suspend(() => {
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
