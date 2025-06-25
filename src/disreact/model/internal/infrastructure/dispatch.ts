import {ASYNC, EFFECT, SYNC} from '#src/disreact/model/internal/core/constants.ts';
import type * as Document from '#src/disreact/model/internal/document.ts';
import * as current from '#src/disreact/model/internal/infrastructure/current.ts';
import * as FC from '#src/disreact/model/internal/infrastructure/fc.ts';
import * as type from '#src/disreact/model/internal/infrastructure/type.ts';
import type * as Jsx from '#src/disreact/model/internal/core/jsx.ts';
import * as Polymer from '#src/disreact/model/internal/polymer.ts';
import type * as Node from '#src/disreact/model/internal/node.ts';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';
import {globalValue} from 'effect/GlobalValue';
import * as P from 'effect/Predicate';

export type dispatch = never;

const mutex = globalValue(Symbol.for('disreact/mutex'), () => E.unsafeMakeSemaphore(1));

export const render = (v: Node.Functional, d: Document.Document<Node.Node>) =>
  pipe(
    mutex.take(1),
    E.andThen(() => {
      current.set(v, d);
      return renderFC(v.component, v.props);
    }),
    E.tap(() => {
      current.reset();
      Polymer.commit(v.polymer!);
      return mutex.release(1);
    }),
    E.tapDefect(() => {
      current.reset();
      return mutex.release(1);
    }),
  );

const renderFC = (fc: FC.FC, props: any) => {
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


export interface EventHandler extends type.Fn {

}

const invokeHandler = (fn: any, event: any) => E.suspend(() => {
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

const runEffect = (fx: Polymer.EffectFn) => E.suspend(() => {
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

const renderEffects = (p: Polymer.Polymer) => E.suspend(() => {
  if (!Polymer.hasEffects(p)) {
    return E.void;
  }
  return pipe(
    Polymer.flush(p),
    E.forEach(runEffect),
    E.asVoid,
  );
});

export const update = () => {};

export const invoke = () => {};

export const mount = () => {};

export const unmount = () => {};

export const hydrate = () => {};

export const dehydrate = () => {};
