import type * as Element from '#src/disreact/model/adaptor/exp/domain/old/element.ts';
import {ASYNC, EFFECT, SYNC} from '#src/disreact/model/internal/core/constants.ts';
import * as type from '#src/disreact/model/internal/core/type.ts';
import * as FC from '#src/disreact/model/internal/domain/fc.ts';
import * as Polymer from '#src/disreact/model/internal/domain/polymer.ts';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';
import {globalValue} from 'effect/GlobalValue';
import * as P from 'effect/Predicate';

const renderEffects = (p: Polymer.Polymer) => E.suspend(() => {
  if (!Polymer.hasEffects(p)) {
    return E.void;
  }
  return pipe(
    Polymer.flush(p),
    E.forEach((f) => {
      if (type.isAsync(f)) {
        return E.promise(f);
      }
      const out = f();

      if (P.isPromise(out)) {
        return E.promise(() => out);
      }
      if (E.isEffect(out)) {
        return out;
      }
      return E.void;
    }),
    E.asVoid,
  );
});

const renderFC = (f: FC.FC, p: any): E.Effect<any> => {
  switch (FC.kind(f)) {
    case SYNC: {
      return E.sync(() => f(p) as Element.Rendered);
    }
    case ASYNC: {
      return E.promise(() => f(p) as Promise<Element.Rendered>);
    }
    case EFFECT: {
      return f(p) as E.Effect<Element.Rendered>;
    }
  }
  return E.suspend(() => {
    const output = f(p);

    if (P.isPromise(output)) {
      FC.cast(f, FC.AsyncPrototype);
      return E.promise(() => output);
    }
    if (E.isEffect(output)) {
      FC.cast(f, FC.EffectPrototype);
      return output as E.Effect<any>;
    }
    FC.cast(f, FC.SyncPrototype);
    return E.succeed(output);
  });
};

export const render = () => {};

export const update = () => {};

export const invoke = () => {};

export const mount = () => {};

export const unmount = () => {};

export const hydrate = () => {};

export const dehydrate = () => {};
