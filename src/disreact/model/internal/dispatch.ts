import type * as Element from '#src/disreact/model/internal/adaptor/exp/domain/old/element.ts';
import {ASYNC, EFFECT, SYNC} from '#src/disreact/model/internal/core/constants.ts';
import * as type from '#src/disreact/model/internal/infrastructure/type.ts';
import * as FC from '#src/disreact/model/internal/infrastructure/fc.ts';
import * as Polymer from '#src/disreact/model/internal/polymer.ts';
import * as E from 'effect/Effect';
import {pipe} from 'effect/Function';
import * as P from 'effect/Predicate';

export type dispatch = never;

const renderJsxFn = (fc: FC.FC, p: any): E.Effect<any> => {
  switch (FC.kind(fc)) {
    case SYNC: {
      return E.sync(() => fc(p) as Element.Rendered);
    }
    case ASYNC: {
      return E.promise(() => fc(p) as Promise<Element.Rendered>);
    }
    case EFFECT: {
      return fc(p) as E.Effect<Element.Rendered>;
    }
  }
  return E.suspend(() => {
    const output = fc(p);

    if (P.isPromise(output)) {
      FC.cast(fc, FC.AsyncPrototype);
      return E.promise(() => output);
    }
    if (E.isEffect(output)) {
      FC.cast(fc, FC.EffectPrototype);
      return output as E.Effect<any>;
    }
    FC.cast(fc, FC.SyncPrototype);
    return E.succeed(output);
  });
};

const renderFx = (fx: Polymer.EffectFn) => E.suspend(() => {
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
    E.forEach(renderFx),
    E.asVoid,
  );
});

export const render = () => {};

export const update = () => {};

export const invoke = () => {};

export const mount = () => {};

export const unmount = () => {};

export const hydrate = () => {};

export const dehydrate = () => {};
